import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileCheck2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DpoDragDropUploadProps {
  onFileLoaded: (fileInfo: { name: string; file_size_kb: number; inferredType: string; rawFile: File }) => void;
  onClear: () => void;
}

export const DpoDragDropUpload: React.FC<DpoDragDropUploadProps> = ({
  onFileLoaded,
  onClear
}) => {
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Infer doc type classification based on keywords in name
  const inferDocumentType = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes("appoint") || lower.includes("letter") || lower.includes("board") || lower.includes("resolution")) {
      return "Official DPO Appointment Letter";
    }
    if (lower.includes("cpe") || lower.includes("training") || lower.includes("course") || lower.includes("education") || lower.includes("seminar")) {
      return "Continuous Education (CPE) Proof";
    }
    return "Certification Certificate";
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    
    // Simple verification (accept images, pdfs, word docs)
    const allowedExtensions = ["pdf", "png", "jpg", "jpeg", "docx", "doc"];
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMsg(`Unsupported file type (.${fileExt}). Please drop PDF, PNG, JPG, or DOCX formats.`);
      return;
    }

    // Limit to 20MB for simulation sanity
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size allowed is 20MB.");
      return;
    }

    setSelectedFile(file);
    
    // Auto populate states in parent
    const cleanName = file.name.replace(/\.[^/.]+$/, ""); // Strip extension
    const kbSize = Math.round(file.size / 1024);
    const inferred = inferDocumentType(file.name);

    onFileLoaded({
      name: cleanName,
      file_size_kb: kbSize,
      inferredType: inferred,
      rawFile: file
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50/50 scale-[1.01] shadow-md shadow-indigo-100"
            : selectedFile
            ? "border-emerald-300 bg-emerald-50/10 hover:bg-emerald-50/20"
            : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/50"
        }`}
      >
        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="dropzone-idle"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center justify-center space-y-2 py-2"
            >
              <div className={`p-3 rounded-full ${isDragActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-50 text-slate-400"} transition-colors`}>
                <UploadCloud className={`w-6 h-6 ${isDragActive ? "animate-bounce" : ""}`} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-slate-800">
                  Drag and drop compliance document
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  or <span className="text-indigo-600 hover:text-indigo-700 font-extrabold underline">browse folders</span> to upload
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Supports PDF, Certificate Copies, JPG, PNG or DOCX (Max 20MB)
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone-loaded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-2.5 bg-emerald-50/40 rounded-lg border border-emerald-100"
            >
              <div className="flex items-center gap-3 text-left min-w-0 flex-grow">
                <div className="p-2 rounded bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Auto-extracted size & keywords
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className="flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-2.5 h-2.5" />
                  STAGED
                </span>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg flex items-start gap-2 text-[11px] leading-relaxed font-semibold"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </motion.div>
      )}
    </div>
  );
};
