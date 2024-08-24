import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module Fileupload {

    // Function to create a new HashMap
    public func createHashMap() : HashMap.HashMap<Principal, [(Nat, Blob)]> {
        HashMap.fromIter<Principal, [(Nat, Blob)]>(Iter.fromList([]), 10, Principal.equal, Principal.hash)
    };

    // Function to initialize a file counter
    public func createFileCounter() : Nat {
        0
    };

    // Function to upload a file and store it for the current user
    // Example function to handle file uploads
    public func uploadFile(
        userFiles: HashMap.HashMap<Principal, [(Nat, Blob)]>,
        fileCounter: Nat,
        userId: Principal,
        fileContent: Blob
    ) : (HashMap.HashMap<Principal, [(Nat, Blob)]>, Nat) {
        let newFileCounter = fileCounter + 1;
        let newFileId = fileCounter;
        let newFile = (newFileId, fileContent);
        
        // Find existing files for the user
        let userFileList = switch (Array.find<[(Nat, Blob)]>(HashMap.entries(userFiles), func(entry) {
            entry.0 == userId
        })) {
            case null { [(newFileId, fileContent)] };
            case (?entry) { Array.append(entry.1, [newFile]) };
        };
        
        let updatedUserFiles = HashMap.put(userFiles, userId, userFileList);
        
        (updatedUserFiles, newFileCounter)
    };

    // Function to retrieve a file by its ID for the current user
    public func getFile(
        userFiles: HashMap.HashMap<Principal, [(Nat, Blob)]>,
        userId: Principal,
        fileId: Nat
    ) : ?Blob {
        let userFileList = HashMap.get(userFiles, userId);

        switch (userFileList) {
            case null { return null; };
            case (?fileList) {
                let result = Array.find<(Nat, Blob)>(fileList, func(tuple) {
                    tuple.0 == fileId
                });

                switch (result) {
                    case null { return null; };
                    case (?tuple) { return ?tuple.1; };
                }
            };
        }
    };

    // Function to delete a file by its ID for the current user
    public func deleteFile(
        userFiles: HashMap.HashMap<Principal, [(Nat, Blob)]>,
        fileId: Nat,
        userId: Principal,
    ) : (HashMap.HashMap<Principal, [(Nat, Blob)]>, Bool) {
        let userFileList = HashMap.get(userFiles, userId);

        let updatedUserFiles = switch (userFileList) {
            case null { userFiles };
            case (?fileList) {
                let updatedList = Array.filter<(Nat, Blob)>(fileList, func(tuple) {
                    tuple.0 != fileId
                });

                if (Array.size(updatedList) == 0) {
                    HashMap.remove(userFiles, userId);
                } else {
                    HashMap.put(userFiles, userId, updatedList);
                }
            };
        };

        (updatedUserFiles, true)
    };
}
