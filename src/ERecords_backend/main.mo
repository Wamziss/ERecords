import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Option "mo:base/Option";
import Array "mo:base/Array";

actor ERecords {

    // A simple map to store files with a unique ID and their contents
    stable var files: [(Nat, Blob)] = [];
    
    // Counter to assign unique IDs to each file
    var fileCounter: Nat = 0;

    // Function to upload a file and store it in the backend
    public shared(msg) func uploadFile(fileContent: Blob): async Nat {
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
    public shared(msg) func deleteFile(fileId: Nat): async Bool {
        let emptyBlob: Blob = Blob.fromArray([]);
        let indexOpt = Array.indexOf<(Nat, Blob)>((fileId, emptyBlob), files, func(tuple1, tuple2) {
            tuple1.0 == tuple2.0
        });
        
        switch(indexOpt) {
            case (?index) {
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
