    import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Char "mo:base/Char";
import Debug "mo:base/Debug";

actor ERecords {

    type FileInfo = {
        id: Text;
        link: Text;
        accessExpiry: Nat; // Store expiry in seconds
        qrCodeUrl: Text;
    };

    private func textHash(t: Text): Nat32 {
        var hash: Nat32 = 0;
        let charArray = Text.toArray(t).vals(); // Convert Text to an array of Char

        // Iterate over each Char in the array
        for (c in charArray) {
            let charCodeNat32 = Char.toNat32(c); // Convert Char to Nat32
            hash := (hash * 31) + charCodeNat32; // Update the hash
        };

        return hash;
    };


    private func textEqual(a: Text, b: Text): Bool {
        return Text.equal(a, b);
    };

    // Initialize the HashMap correctly
    // Initial capacity for the HashMap, you can adjust this value as needed
    let initialCapacity: Nat = 100; 
    

    // Create the HashMap with the correct arguments
    var fileMap: HashMap.HashMap<Text, FileInfo> = HashMap.HashMap<Text, FileInfo>(initialCapacity, textEqual, textHash );


        // private func textEqual(t1: Text, t2: Text): Bool {
        // return t1 == t2;
        // };


    // Add a function to verify the session key
    var sessionKeys: HashMap.HashMap<Text, Nat> = HashMap.HashMap<Text, Nat>(initialCapacity, textEqual, textHash);

    // Function to add a session key (for example purposes)
    public func addSessionKey(sessionKey: Text, userId: Nat): async Text {
    var MAX_SESSION_KEY_SIZE: Nat = 64;
    var MAX_USER_ID: Nat = 1_000_000;

    // Validate sessionKey length
    if (Text.size(sessionKey) > MAX_SESSION_KEY_SIZE) {
        return "Session key too long";
    };

    // Validate userId
    if (userId > MAX_USER_ID) {
        return "User ID too large";

    };

    // Store the session key with an associated user ID
    sessionKeys.put(sessionKey, userId);
    return "Session key added";
    };

    // Function to verify a session key
    public func verifySessionKey(sessionKey: Text): async Bool {
        // Check if the session key exists in the in-memory storage
        let isvalid = true;
        let isntvalid = false;
        switch (sessionKeys.get(sessionKey)) {
            case (?_) {
                // Session key is valid
                isvalid;
            };
            case null {
                // Session key is not valid
               isntvalid
            };
        }
    };

    private func generateQRCode(data: Text): Text {
    let qrCodeServiceUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";
    let qrCodeUrl = qrCodeServiceUrl # data; // Concatenate the URL with data

    return qrCodeUrl;
    };


public func generateAccessLink(fileId: Text, accessTimeInSeconds: Int, sessionKey: Text): async Text {
    let isValid = await verifySessionKey(sessionKey);

    let currentTime = Time.now(); // Get current time in seconds
    Debug.print("Current time: " # Int.toText(currentTime));

    let currentTimeText = Int.toText(currentTime);
    let accessExpiry = currentTime + accessTimeInSeconds; // Calculate expiry time in seconds

    // let maxNat = 9007199254740991;
    // let HalfMaxNat: Nat = (maxNat / 2);

    // Declare maxNat as a variable holding the maximum value a Nat can hold
    let maxNat: Nat = 90070991;


    // Calculate HalfMaxNat by dividing maxNat by 2
    let HalfMaxNat: Nat = maxNat / 2;

    // Check if the calculated accessExpiry is within a safe range
    if (accessExpiry > HalfMaxNat) {
        return "Access expiry time too large"; // Handle the error gracefully
    };

    let uniqueId = Text.concat(fileId , currentTimeText);
    let uniqueLink = uniqueId # "http://localhost:4943/?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai/share/" # fileId;

    let qrCodeUrl = generateQRCode(uniqueLink);
     //  2024-08-23 08:32:29.616126567 UTC: [Canister bkyz2-fmaaa-aaaaa-qaaaq-cai] "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:4943/?canisterId=bkyz2-fmaaa-aaaaa-qaaaq-cai/share/1"

    func intToNat(x: Int): Nat {
        let accessExpiryTxt = Int.toText(x);
        switch (Nat.fromText(accessExpiryTxt)) {
            case (?value) {
                value // Return the converted Nat value
            };
            case null {
                0
            };
        }
    };

    // Usage example
    let accessExpiryNat = intToNat(accessExpiry); // Convert Int to Nat

        // Create the FileInfo with the converted Nat value
        let fileInfo: FileInfo = {
            id = fileId;
            link = uniqueLink;
            accessExpiry = accessExpiryNat;
            qrCodeUrl = qrCodeUrl;
        };


        fileMap.put(fileId, fileInfo);

        return uniqueLink;
    };



    public func isAccessValid(fileId: Text): async Bool {
        switch (fileMap.get(fileId)) {
            case (?fileInfo) {
                let currentTime = Time.now();
                return currentTime <= fileInfo.accessExpiry;
            };
            case (_) {
                return false;
            };
        }
    };

// working file handling
// A simple map to store files with a unique ID and their contents
    stable var files: [(Nat, Blob)] = [];
    
    // Counter to assign unique IDs to each file
    var fileCounter: Nat = 0;

    // Function to upload a file and store it in the backend
    public shared(_msg) func uploadFile(fileContent: Blob): async Nat {
        let fileId = fileCounter;
        files := Array.append(files, [(fileId, fileContent)]);
        fileCounter += 1;
        return fileId;
    };

    // Function to retrieve a file by its ID
    public query func getFile(fileId: Nat): async ?Blob {
        let result = Array.find<(Nat, Blob)>(files, func(tuple) {
            tuple.0 == fileId
        });
        
        switch (result) {
            case null { return null; };
            case (?tuple) { return ?tuple.1; };
        }
    };

    // Function to delete a file by its ID
    public shared(_msg) func deleteFile(fileId: Nat): async Bool {
        let emptyBlob: Blob = Blob.fromArray([]);
        let indexOpt = Array.indexOf<(Nat, Blob)>((fileId, emptyBlob), files, func(tuple1, tuple2) {
            tuple1.0 == tuple2.0
        });
        
        switch(indexOpt) {
            case (?_index) {
                files := Array.filter<(Nat, Blob)>(files, func(tuple) {
                    tuple.0 != fileId
                });
                return true;
            };
            case null {
                return false;
            };
        };
    };
}
