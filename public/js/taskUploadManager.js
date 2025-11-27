/**
 * Task Upload Manager
 * Handles file uploads and viewing for all task pages
 */
class TaskUploadManager {
    constructor(taskId) {
        this.taskId = taskId;
        this.uploadBox = document.getElementById("uploadBox");
        this.fileInput = document.getElementById("fileInput");
        this.uploadText = document.getElementById("uploadText");
        this.fileName = document.getElementById("fileName");
        this.submitBtn = document.getElementById("submitBtn");
        this.viewSubmissionBtn = document.getElementById("viewSubmissionBtn");

        this.selectedPDF = null;
        this.init();
    }

    init() {
        // File selection
        this.fileInput.addEventListener("change", () => {
            const file = this.fileInput.files[0];
            this.handleFile(file);
        });

        // Drag events
        if (this.uploadBox) {
            this.uploadBox.addEventListener("dragover", (e) => {
                e.preventDefault();
                this.uploadBox.classList.add("dragover");
            });

            this.uploadBox.addEventListener("dragleave", () => {
                this.uploadBox.classList.remove("dragover");
            });

            this.uploadBox.addEventListener("drop", (e) => {
                e.preventDefault();
                this.uploadBox.classList.remove("dragover");
                const file = e.dataTransfer.files[0];
                this.handleFile(file);
            });
        }

        // Submit button
        if (this.submitBtn) {
            this.submitBtn.addEventListener("click", () => this.submitFile());
        }

        // View submission button
        if (this.viewSubmissionBtn) {
            this.viewSubmissionBtn.addEventListener("click", () => this.viewSubmission());
        }

        // Load submission status on page load
        window.addEventListener("load", () => this.loadSubmissionStatus());
    }

    handleFile(file) {
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Only PDF files allowed!");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File must be less than 10MB!");
            return;
        }

        this.selectedPDF = file;
        this.uploadText.innerText = "File selected";
        this.fileName.innerText = "Selected: " + file.name;
        this.submitBtn.disabled = false;
        this.submitBtn.classList.add("enabled");
    }

    async submitFile() {
        if (!this.selectedPDF) {
            alert("Please upload a PDF first!");
            return;
        }

        this.submitBtn.disabled = true;
        this.submitBtn.innerText = "Uploading...";
        const originalFileName = this.selectedPDF.name;

        const formData = new FormData();
        formData.append("file", this.selectedPDF);
        formData.append("taskId", this.taskId);

        try {
            const response = await fetch("/upload-task-file", {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Update UI
                this.fileName.innerText = "✅ Uploaded: " + originalFileName;
                this.uploadText.innerText = "Upload successful";
                
                // Show success alert
                alert("✅ File uploaded successfully!\n\nFilename: " + originalFileName);
                
                // Reset form
                this.submitBtn.innerText = "Submit Task";
                this.submitBtn.disabled = true;
                this.selectedPDF = null;
                this.fileInput.value = "";
                
                // Load updated submission status
                setTimeout(() => this.loadSubmissionStatus(), 500);
            } else {
                alert("❌ Error uploading file:\n" + data.message);
                this.submitBtn.disabled = false;
                this.submitBtn.innerText = "Submit Task";
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("❌ Error uploading file:\n" + error.message);
            this.submitBtn.disabled = false;
            this.submitBtn.innerText = "Submit Task";
        }
    }

    async viewSubmission() {
        try {
            const response = await fetch(`/get-task-submission?taskId=${this.taskId}`);
            const data = await response.json();

            if (data.success && data.submission.filePath) {
                // Open PDF in new tab
                window.open(data.submission.filePath, '_blank');
            } else {
                alert("No submission found for this task yet!");
            }
        } catch (error) {
            console.error("Error fetching submission:", error);
            alert("Error fetching submission: " + error.message);
        }
    }

    async loadSubmissionStatus() {
        try {
            const response = await fetch(`/get-task-submission?taskId=${this.taskId}`);
            const data = await response.json();

            if (data.success && data.submission.originalFileName) {
                this.fileName.innerText = "Current submission: " + data.submission.originalFileName;
            }
        } catch (error) {
            console.log("No previous submission found");
        }
    }
}
