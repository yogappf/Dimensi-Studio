const fs = require('fs');
let code = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

const imageViewerModal = `
      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-[#141414] border border-[#D4AF37]/50 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-[#D4AF37] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Pratinjau Bukti Transfer</span>
              </span>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={viewingProofUrl}
                alt="Bukti Transfer Pembayaran"
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>
            <div className="text-right pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-white/10 text-white text-xs uppercase font-mono cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace('{/* Modal: Reminder Message */}', imageViewerModal + '\\n      {/* Modal: Reminder Message */}');

fs.writeFileSync('src/components/ConsumerDashboard.tsx', code);
