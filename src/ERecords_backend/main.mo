import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Hash "mo:base/Hash";

actor ERecords {
    // File structure
    type File = {
        id: Nat;
        content: Blob;
        name: Text;
        folder: Text;
        uploadTime: Time.Time;
        shareExpiry: ?Time.Time;
        isArchived: Bool;
    };

    // Stable storage for files
    private stable var fileEntries: [(Nat, File)] = [];
    private var files = HashMap.HashMap<Nat, File>(0, Nat.equal, Hash.hash);

    // Counter to assign unique IDs to each file
    private stable var fileCounter: Nat = 0;

    // Function to upload a file and store it in the backend
    public shared func uploadFile(fileContent: Blob, fileName: Text, folder: Text): async Nat {
        let fileId = fileCounter;
        let newFile: File = {
            id = fileId;
            content = fileContent;
            name = fileName;
            folder = folder;
            uploadTime = Time.now();
            shareExpiry = null;
            isArchived = false;
        };
        files.put(fileId, newFile);
        fileCounter += 1;
        fileId
    };

    // Function to retrieve a file by its ID
    public query func getFile(fileId: Nat): async ?File {
        files.get(fileId)
    };

    // Function to delete a file by its ID
    public shared func deleteFile(fileId: Nat): async Bool {
        switch (files.remove(fileId)) {
            case null { false };
            case (?_) { true };
        }
    };

    // Function to generate a QR code for sharing files (placeholder)
    public func generateQRCode(fileId: Nat): async Text {
        // In a real implementation, you would use a QR code generation library
        // For now, we'll return a placeholder string
        "QR_CODE_FOR_FILE_" # Nat.toText(fileId)
    };

    // Function to set or extend access timer for shared files
    public func setShareExpiry(fileId: Nat, expiryTime: Time.Time): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                let updatedFile = {
                    id = file.id;
                    content = file.content;
                    name = file.name;
                    folder = file.folder;
                    uploadTime = file.uploadTime;
                    shareExpiry = ?expiryTime;
                    isArchived = file.isArchived;
                };
                files.put(fileId, updatedFile);
                true
            };
        }
    };

    // Function to revoke access to a shared file
    public func revokeAccess(fileId: Nat): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                let updatedFile = {
                    id = file.id;
                    content = file.content;
                    name = file.name;
                    folder = file.folder;
                    uploadTime = file.uploadTime;
                    shareExpiry = null;
                    isArchived = file.isArchived;
                };
                files.put(fileId, updatedFile);
                true
            };
        }
    };

    // Function to search for records
    public func searchFiles(searchTerm: Text) : async [File] {
        let lowercaseSearchTerm = Text.toLowercase(searchTerm);
        
        let searchResults = Array.filter<File>(Iter.toArray(files.vals()), func (file: File) : Bool {
            let lowercaseFileName = Text.toLowercase(file.name);
            Text.contains(lowercaseFileName, #text lowercaseSearchTerm)
        });
        
        searchResults
    };

    // Function to move a file to a different folder
    public func moveFile(fileId: Nat, newFolder: Text): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                let updatedFile = {
                    id = file.id;
                    content = file.content;
                    name = file.name;
                    folder = newFolder;
                    uploadTime = file.uploadTime;
                    shareExpiry = file.shareExpiry;
                    isArchived = file.isArchived;
                };
                files.put(fileId, updatedFile);
                true
            };
        }
    };

    // Function to archive a file
    public func archiveFile(fileId: Nat): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                let updatedFile = {
                    id = file.id;
                    content = file.content;
                    name = file.name;
                    folder = file.folder;
                    uploadTime = file.uploadTime;
                    shareExpiry = file.shareExpiry;
                    isArchived = true;
                };
                files.put(fileId, updatedFile);
                true
            };
        }
    };

    // Function to unarchive a file
    public func unarchiveFile(fileId: Nat): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                let updatedFile = {
                    id = file.id;
                    content = file.content;
                    name = file.name;
                    folder = file.folder;
                    uploadTime = file.uploadTime;
                    shareExpiry = file.shareExpiry;
                    isArchived = false;
                };
                files.put(fileId, updatedFile);
                true
            };
        }
    };

    // Helper function to convert HashMap to stable storage
    private func hashMapToArray(): [(Nat, File)] {
        Iter.toArray(files.entries())
    };

    // System functions to handle upgrades
    system func preupgrade() {
        fileEntries := hashMapToArray();
    };

    system func postupgrade() {
        files := HashMap.fromIter<Nat, File>(fileEntries.vals(), 0, Nat.equal, Hash.hash);
        fileEntries := [];
    };
}