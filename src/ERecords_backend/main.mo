import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

actor ERecords {
    // File structure
    type File = {
        id: Text;
        content: Blob;
        name: Text;
        folder: Text;
        uploadTime: Time.Time;
        shareExpiry: ?Time.Time;
        isArchived: Bool;
        userId: Text; // Add userId to the file structure
    };

    // Stable storage for files
    private stable var fileEntries: [(Text, File)] = [];
    private var files = HashMap.HashMap<Text, File>(0, Text.equal, Text.hash);

    private var tokens = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);

    // Function to upload a file and store it in the backend
    public shared func uploadFile(fileId: Text, fileContent: Blob, fileName: Text, folder: Text, userId: Text): async Text {
        let newFile: File = {
            id = fileId;
            content = fileContent;
            name = fileName;
            folder = folder;
            uploadTime = Time.now();
            shareExpiry = null;
            isArchived = false;
            userId = userId; // Set the user ID
        };
        files.put(fileId, newFile);
        fileId
    };

    // Function to retrieve a file by its ID if it belongs to the requesting user
    public query func getFile(fileId: Text, userId: Text): async ?File {
        switch (files.get(fileId)) {
            case null { null };
            case (?file) {
                if (file.userId == userId) { // Check if the file belongs to the user
                    ?file
                } else {
                    null
                }
            };
        }
    };

    // Function to retrieve all files associated with a specific user ID
    public query func getUserFiles(userId: Text): async [File] {
        Array.filter<File>(
            Iter.toArray(files.vals()), 
            func(file: File): Bool {
                file.userId == userId
            }
        )
    };

public shared func deleteFile(fileId: Text, userId: Text): async Bool {
    switch (files.get(fileId)) {
        case null { false };
        case (?file) {
            if (file.userId == userId) {
                switch (files.remove(fileId)) {
                    case null { false };
                    case (?_) {
                        // Update stable storage
                        fileEntries := hashMapToArray();
                        true;
                    };
                }
            } else {
                false
            }
        };
    }
};


    // // Function to delete a file by its ID if it belongs to the requesting user
    // public shared func deleteFile(fileId: Text, userId: Text): async Bool {
    //     switch (files.get(fileId)) {
    //         case null { false };
    //         case (?file) {
    //             if (file.userId == userId) { // Check if the file belongs to the user
    //                 switch (files.remove(fileId)) {
    //                     case null { false };
    //                     case (?_) { true };
    //                 }
    //             } else {
    //                 false
    //             }
    //         };
    //     }
    // };

    // Function to generate a QR code for sharing files (placeholder)
    public func generateQRCode(fileId: Text): async Text {
        // In a real implementation, you would use a QR code generation library
        // For now, we'll return a placeholder string
        "QR_CODE_FOR_FILE_" # fileId;
    };

    // Function to set or extend access timer for shared files
    public func setShareExpiry(fileId: Text, expiryTime: Time.Time, userId: Text): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                if (file.userId == userId) { // Check if the file belongs to the user
                    let updatedFile = {
                        id = file.id;
                        content = file.content;
                        name = file.name;
                        folder = file.folder;
                        uploadTime = file.uploadTime;
                        shareExpiry = ?expiryTime;
                        isArchived = file.isArchived;
                        userId = file.userId; // Preserve the user ID
                    };
                    files.put(fileId, updatedFile);
                    true
                } else {
                    false
                }
            };
        }
    };

    // Function to revoke access to a shared file
    public func revokeAccess(fileId: Text, userId: Text): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                if (file.userId == userId) { // Check if the file belongs to the user
                    let updatedFile = {
                        id = file.id;
                        content = file.content;
                        name = file.name;
                        folder = file.folder;
                        uploadTime = file.uploadTime;
                        shareExpiry = null;
                        isArchived = file.isArchived;
                        userId = file.userId; // Preserve the user ID
                    };
                    files.put(fileId, updatedFile);
                    true
                } else {
                    false
                }
            };
        }
    };

    // Function to search for records based on the user ID
    public func searchFiles(searchTerm: Text, userId: Text) : async [File] {
        let lowercaseSearchTerm = Text.toLowercase(searchTerm);
        
        let searchResults = Array.filter<File>(Iter.toArray(files.vals()), func (file: File) : Bool {
            let lowercaseFileName = Text.toLowercase(file.name);
            file.userId == userId and Text.contains(lowercaseFileName, #text lowercaseSearchTerm)
        });
        
        searchResults
    };

    // Function to move a file to a different folder if it belongs to the requesting user
    public func moveFile(fileId: Text, newFolder: Text, userId: Text): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                if (file.userId == userId) { // Check if the file belongs to the user
                    let updatedFile = {
                        id = file.id;
                        content = file.content;
                        name = file.name;
                        folder = newFolder;
                        uploadTime = file.uploadTime;
                        shareExpiry = file.shareExpiry;
                        isArchived = file.isArchived;
                        userId = file.userId; // Preserve the user ID
                    };
                    files.put(fileId, updatedFile);
                    true
                } else {
                    false
                }
            };
        }
    };

    // Function to archive a file if it belongs to the requesting user
    public func archiveFile(fileId: Text, userId: Text): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                if (file.userId == userId) { // Check if the file belongs to the user
                    let updatedFile = {
                        id = file.id;
                        content = file.content;
                        name = file.name;
                        folder = file.folder;
                        uploadTime = file.uploadTime;
                        shareExpiry = file.shareExpiry;
                        isArchived = true;
                        userId = file.userId; // Preserve the user ID
                    };
                    files.put(fileId, updatedFile);
                    true
                } else {
                    false
                }
            };
        }
    };

    // Function to unarchive a file if it belongs to the requesting user
    public func unarchiveFile(fileId: Text, userId: Text): async Bool {
        switch (files.get(fileId)) {
            case null { false };
            case (?file) {
                if (file.userId == userId) { // Check if the file belongs to the user
                    let updatedFile = {
                        id = file.id;
                        content = file.content;
                        name = file.name;
                        folder = file.folder;
                        uploadTime = file.uploadTime;
                        shareExpiry = file.shareExpiry;
                        isArchived = false;
                        userId = file.userId; // Preserve the user ID
                    };
                    files.put(fileId, updatedFile);
                    true
                } else {
                    false
                }
            };
        }
    };

    // Function to store a token
    public shared func storeToken(token: Text, content: Text) : async () {
        tokens.put(token, content);
    };

    // Function to retrieve content by token
    public query func getContentByToken(token: Text) : async ?Text {
        tokens.get(token)
    };

    // Helper function to convert HashMap to stable storage
    private func hashMapToArray(): [(Text, File)] {
        Iter.toArray(files.entries())
    };

    // System functions to handle upgrades
    system func preupgrade() {
        fileEntries := hashMapToArray();
    };

    system func postupgrade() {
        files := HashMap.fromIter<Text, File>(fileEntries.vals(), 0, Text.equal, Text.hash);
        // Ensure fileEntries is only set with current files
        fileEntries := hashMapToArray();
    };

}