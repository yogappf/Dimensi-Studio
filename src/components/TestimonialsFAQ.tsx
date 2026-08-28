import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, HelpCircle, Heart, ShieldCheck, Camera, Sparkles } from 'lucide-react';

export const TestimonialsFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const testimonials = [
    {
      name: 'Rian & Clarissa',
      role: 'Klien Wedding Royal Eternity',
      rating: 5,
      comment: 'Hasil fotonya bener-bener mewah dan cinematic banget! Tone warnanya khas Dimensi Studio, gak norak dan tahan zaman. Album fisik kolasenya juga sangat tebal & premium. Terima kasih Mas Fotografer!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Dr. Hendra Gunawan',
      role: 'Klien Foto Keluarga & Anak',
      rating: 5,
      comment: 'Studionya nyaman banget, adem dan ramah anak balita. Fotografernya sabar ngarahin gaya anak-anak yang aktif. File Google Drive dikirim cepat dan kualitas cetak kanvasnya luar biasa.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Siti Nurhaliza, S.Kom',
      role: 'Klien Foto Wisuda UI',
      rating: 5,
      comment: 'Puas banget foto wisuda di sini. Retouch wajahnya halus natural tanpa keliatan palsu. Admin WhatsApp-nya responsif dan ramah. Recommended buat yang mau wisuda bareng keluarga!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const faqs = [
    {
      q: 'Bagaimana cara mendaftar atau booking jadwal pemotretan?',
      a: 'Sangat mudah! Anda cukup memilih paket yang diinginkan di menu Paket & Harga, lalu klik tombol "Booking / Order Paket Ini", lengkapi formulir pendaftaran dengan tanggal & lokasi, lalu konfirmasi. Anda akan mendapatkan Nota Digital resmi dan dapat langsung menghubungkan chat WhatsApp admin kami.'
    },
    {
      q: 'Berapa persen ketentuan DP (Down Payment) untuk mengunci jadwal?',
      a: 'Untuk mengunci tanggal dan jam fotografer kami, DP dapat dipilih sebesar 30% atau 50% dari total biaya. Pelunasan sisa pembayaran dapat dilakukan pada hari H pemotretan atau sebelum pengiriman album cetak fisik.'
    },
    {
      q: 'Berapa lama estimasi proses editing dan pengiriman hasil foto?',
      a: 'Semua file master original kami berikan maksimal H+1 via Google Drive. Untuk foto yang dipilih untuk retouch halus & color grading selesai dalam 7–14 hari kerja (atau 24 jam bila mengambil layanan Add-on Express Editing).'
    },
    {
      q: 'Apakah bisa sesi foto di luar studio (Outdoor / Lokasi Acara Gedung)?',
      a: 'Tentu bisa! Tim fotografer kami siap melayani pemotretan di seluruh wilayah Jabodetabek, Bandung, hingga luar kota sesuai kesepakatan lokasi pemesanan Anda.'
    },
    {
      q: 'Apakah ada garansi jika hasil cetak atau album cacat pengiriman?',
      a: 'Ya, kami memberikan garansi 100% cetak ulang gratis jika ditemukan cacat produksi pada album kolase, frame, maupun kanvas yang Anda terima.'
    }
  ];

  return (
    <section id="tentang-faq" className="py-16 bg-[#0A0A0A] text-[#E0E0E0] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Testimonials */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
              <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
              <span>Kepuasan Pelanggan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Cerita Kebahagiaan <span className="italic font-serif text-[#D4AF37]">Klien Kami</span>
            </h2>
            <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
              Kepercayaan Anda adalah prioritas tertinggi kami dalam menghasilkan karya visual berkelas yang tak lekang oleh waktu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#141414] border border-white/10 flex flex-col justify-between space-y-4 hover:border-[#D4AF37] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(testi.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                    "{testi.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <img
                    src={testi.avatar}
                    alt={testi.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover border border-[#D4AF37]/50"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white">{testi.name}</h4>
                    <span className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-wider">{testi.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto pt-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
              <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
              <span>Tanya & Jawab</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-white">
              Informasi & <span className="italic font-serif text-[#D4AF37]">FAQ Reservasi</span>
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#141414] border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-white/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
