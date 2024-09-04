import Blob "mo:base/Blob";
import Text "mo:base/Text";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Char "mo:base/Char";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Random "mo:base/Random";
import Principal "mo:base/Principal";

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

    type Message = {
        id: Text;
        sender: Text;
        subject: Text;
        body: Text;
        attachment: ?Blob;
        // timestamp: Time.Time;
        timestamp: Text;
    };

    type MailAccount = {
        inbox: [Message];
    };

    private var mailAccounts = HashMap.HashMap<Text, MailAccount>(0, Text.equal, Text.hash);

    // Stable storage for upgrade purposes
    private stable var mailAccountsStorage: [(Text, MailAccount)] = [];

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


// Mail system

// public query func getUserId(msg: {caller: Principal}): async Text {
//     let userPrincipal = msg.caller;
//     return Principal.toText(userPrincipal);
// };
// import Principal "mo:base/Principal";
// public query func getUserId(caller: Principal): async Text {
//     return Principal.toText(caller);
// };




    // Mail Functions
    public shared func createMailAccount(userId: Text): async Bool {
        switch (mailAccounts.get(userId)) {
            case (null) {
                let newAccount: MailAccount = {
                    inbox = [];
                };
                mailAccounts.put(userId, newAccount);
                true;
            };
            case (?_) { false };
        }
    };

public shared func sendMessage(
    senderId: Text,
    recipientId: Text,
    subject: Text,
    body: Text,
    attachment: ?Blob
): async Bool {
    let messageId = generateMessageId();
    let newMessage: Message = {
        id = await messageId;
        sender = senderId;
        subject = subject;
        body = body;
        attachment = attachment; // This can be null or Some(Blob)
        timestamp = generateTimestamp();
    };

    switch (mailAccounts.get(recipientId)) {
        case (null) { false };
        case (?account) {
            let updatedInbox = Array.append(account.inbox, [newMessage]);
            let updatedAccount = {
                inbox = updatedInbox;
            };
            mailAccounts.put(recipientId, updatedAccount);
            true;
        };
    }
};



    public query func receiveMessages(userId: Text): async [Message] {
        switch (mailAccounts.get(userId)) {
            case (null) { [] };
            case (?account) { account.inbox };
        }
    };


    public query func getMessage(userId: Text, messageId: Text): async ?Message {
        switch (mailAccounts.get(userId)) {
            case (null) { null };
            case (?account) {
                // Search for the message with the given ID
                let foundMessage = Array.find<Message>(account.inbox, func(msg) {
                    msg.id == messageId
                });
                foundMessage
            };
        }
    };

    public query func getAttachment(userId: Text, messageId: Text): async ?Blob {
        switch (mailAccounts.get(userId)) {
            case (null) { null };
            case (?account) {
                // Find the message and return the attachment
                let foundMessage = Array.find<Message>(account.inbox, func(msg) {
                    msg.id == messageId
                });
                switch (foundMessage) {
                    case (null) { null };
                    case (?msg) { msg.attachment };
                }
            };
        }
    };

    public shared func deleteMessage(userId: Text, messageId: Text): async Bool {
        switch (mailAccounts.get(userId)) {
            case (null) { false };
            case (?account) {
                // Filter out the message with the given ID
                let updatedInbox = Array.filter<Message>(account.inbox, func(msg) {
                    msg.id != messageId
                });
                let updatedAccount = {
                    inbox = updatedInbox
                };
                mailAccounts.put(userId, updatedAccount);
                true;
            };
        }
    };

    public query func searchMessages(userId: Text, searchTerm: Text): async [Message] {
        let lowercaseSearchTerm = Text.toLowercase(searchTerm);
        switch (mailAccounts.get(userId)) {
            case (null) { [] };
            case (?account) {
                // Filter messages based on search term
                Array.filter<Message>(account.inbox, func(msg) {
                    let lowercaseSubject = Text.toLowercase(msg.subject);
                    Text.contains(lowercaseSubject, #text lowercaseSearchTerm)
                })
            };
        }
    };


  
  // Simple pseudo-random number generator based on time
    private func intToText(n: Int): Text {
        if (n == 0) {
            return "0";
        };
        var num = n;
        var result = "";
        let digits = Text.toArray("0123456789");
        while (num > 0) {
            let digit = Int.abs(num % 10);
            result := Text.concat(Text.fromChar(digits[digit]), result);
            num := num / 10;
        };
        result
    };






        // Simple pseudo-random number generator based on time
    private func blobToHex(blob: Blob): Text {
        let hexDigits = Text.toArray("0123456789ABCDEF");
        var result = "";
        for (byte in blob.vals()) {
            let highNibble = Nat8.toNat(byte / 16);
            let lowNibble = Nat8.toNat(byte % 16);
            result := Text.concat(result, Text.fromChar(hexDigits[highNibble]));
            result := Text.concat(result, Text.fromChar(hexDigits[lowNibble]));
        };
        result
    };


    // Generate a unique message ID
private func generateMessageId(): async Text {
    let now = Time.now();
    let nowSeconds = now / (1_000_000_000); // Convert to seconds
    let randomPart = await Random.blob(); // Generate random bytes

    // Convert the time and random part to text
    let timeText = intToText(nowSeconds);
    let randomText = blobToHex(randomPart);

    // Concatenate for a unique identifier
    let id = Text.concat(timeText, "_");
    Text.concat(id, randomText)
};


    // Generate a timestamp
    private func generateTimestamp(): Text {
        let now = Time.now();
        let nowSeconds = now / (1_000_000_000); // Convert to seconds

        // Convert the time to text
        intToText(nowSeconds)
    };



    // Pre and Post Upgrade Functions
    system func preupgrade() {
        fileEntries := hashMapToArray();
        mailAccountsStorage := Iter.toArray(mailAccounts.entries());
    };

    system func postupgrade() {
        files := HashMap.fromIter<Text, File>(fileEntries.vals(), 0, Text.equal, Text.hash);
        // Ensure fileEntries is only set with current files
        fileEntries := hashMapToArray();

        mailAccounts := HashMap.fromIter<Text, MailAccount>(
            mailAccountsStorage.vals(),
            0,
            Text.equal,
            Text.hash
        );
        mailAccountsStorage := Iter.toArray(mailAccounts.entries());
    };

        // Helper function to convert HashMap to stable storage
    private func hashMapToArray(): [(Text, File)] {
        Iter.toArray(files.entries())
    };

    // System functions to handle upgrades

 


}