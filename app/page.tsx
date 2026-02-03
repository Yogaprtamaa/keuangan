'use client'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Wallet, ArrowUpRight, ArrowDownLeft, Smartphone, Store, ShoppingCart, 
  History, Trash2, X, BarChart3, Eye, EyeOff, Calendar, DollarSign, Info
} from 'lucide-react'

interface Transaksi {
  id: string
  keterangan: string
  tanggal: string
  tipe: 'MASUK' | 'KELUAR'
  metode: 'online' | 'offline' | null
  jumlah: number
  biayaAdmin: number
  totalBersih: number
}

interface FormData {
  keterangan: string
  jumlah: number
  tipe: 'MASUK' | 'KELUAR'
  metode: 'offline' | 'online'
  tanggal: string
}

export default function DashboardKeuangan() {
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedTipe, setSelectedTipe] = useState<'MASUK' | 'KELUAR'>('MASUK')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; keterangan: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [showBalance, setShowBalance] = useState(true)
  const queryClient = useQueryClient()

  const { data: transaksi = [], isLoading, error } = useQuery<Transaksi[]>({
    queryKey: ['transaksi'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/transaksi');
        return res.data;
      } catch (error) {
        console.error('Error fetching transaksi:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: report } = useQuery({
    queryKey: ['report', reportPeriod],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/transaksi/summary?period=${reportPeriod}`);
        return res.data;
      } catch (error) {
        console.error('Error fetching report:', error);
        throw error;
      }
    },
    enabled: reportOpen,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => axios.post('/api/transaksi', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaksi'] })
      setModalOpen(false)
      reset()
      setToast('Berhasil disimpan')
      setTimeout(() => setToast(null), 3000)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/transaksi?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaksi'] })
      setToast('Berhasil dihapus')
      setDeleteConfirm(null)
      setTimeout(() => setToast(null), 3000)
    },
  })

  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: {
      keterangan: '',
      jumlah: 0,
      tipe: 'MASUK',
      metode: 'offline',
      tanggal: new Date().toISOString().split('T')[0],
    },
  })

  const jumlah = watch('jumlah') || 0
  const metode = watch('metode')
  const fee = selectedTipe === 'KELUAR' && metode === 'online' ? Math.round(jumlah * 0.35) : 0
  const netto = jumlah - fee

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    return transaksi.reduce((acc, t) => {
      const isToday = new Date(t.tanggal).toDateString() === today
      const bersih = t.jumlah - (t.biayaAdmin || 0)
      if (t.tipe === 'MASUK') {
        acc.saldo += bersih
        if (isToday) acc.todayIn += bersih
      } else {
        acc.saldo -= t.jumlah
        if (isToday) acc.todayOut += t.jumlah
      }
      return acc
    }, { saldo: 0, todayIn: 0, todayOut: 0 })
  }, [transaksi])

  const onSubmit = (data: FormData) => mutation.mutate({ ...data, tipe: selectedTipe })

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
        <Wallet className="text-teal-600" size={56} strokeWidth={1.5} />
      </motion.div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">KasPro</h1>
              <p className="text-xs text-gray-500">Catat Keuangan</p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setReportOpen(true)} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <BarChart3 size={20} className="text-gray-700" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-md hover:bg-teal-700 transition-colors">
              <Plus size={18} /> Tambah
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 pt-8 space-y-10">
        {/* Hero Saldo */}
        <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-7">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Saldo Saat Ini</p>
              <div className="mt-2">
                {showBalance ? (
                  <h2 className="text-4xl font-bold text-gray-900">Rp {stats.saldo.toLocaleString('id-ID')}</h2>
                ) : (
                  <h2 className="text-4xl font-bold text-gray-400 tracking-widest">••••••••</h2>
                )}
              </div>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              {showBalance ? <EyeOff size={22} className="text-gray-600" /> : <Eye size={22} className="text-gray-600" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <ArrowUpRight size={18} className="text-teal-600" />
                <span className="text-xs text-teal-700">Masuk hari ini</span>
              </div>
              <p className="text-2xl font-semibold text-teal-700">+Rp {stats.todayIn.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <ArrowDownLeft size={18} className="text-orange-600" />
                <span className="text-xs text-orange-700">Keluar hari ini</span>
              </div>
              <p className="text-2xl font-semibold text-orange-700">Rp {stats.todayOut.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Riwayat */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800">Riwayat Transaksi</h3>
            <span className="text-sm text-gray-500">{transaksi.length} item</span>
          </div>

          <div className="space-y-4">
            {transaksi.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                <Wallet size={48} className="mx-auto mb-4 text-gray-400" strokeWidth={1.4} />
                <p className="text-gray-600 font-medium">Belum ada transaksi</p>
                <p className="text-sm text-gray-500 mt-1">Mulai catat sekarang</p>
              </div>
            ) : (
              transaksi.map(t => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-5 hover:shadow-md transition-shadow group relative"
                >
                  <div className={`p-4 rounded-xl ${
                    t.tipe === 'MASUK' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {t.tipe === 'MASUK' 
                      ? (t.metode === 'online' ? <Smartphone size={22} /> : <Store size={22} />)
                      : <ShoppingCart size={22} />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-base text-gray-900 truncate">{t.keterangan}</p>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      <span>•</span>
                      {t.tipe === 'MASUK' ? (t.metode === 'online' ? 'Online' : 'Tunai') : 'Pengeluaran'}
                      {t.biayaAdmin > 0 && <><span>•</span><span className="text-orange-600">Fee 35%</span></>}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold text-lg ${
                      t.tipe === 'MASUK' ? 'text-teal-600' : 'text-orange-600'
                    }`}>
                      {t.tipe === 'MASUK' ? '+' : '−'} {t.jumlah.toLocaleString('id-ID')}
                    </p>
                    {t.biayaAdmin > 0 && <p className="text-xs text-orange-600 mt-0.5">−{t.biayaAdmin.toLocaleString('id-ID')}</p>}
                  </div>

                  <button
                    onClick={() => setDeleteConfirm({ id: t.id, keterangan: t.keterangan })}
                    className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-white shadow-lg border border-gray-200 text-gray-800 font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={28} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hapus transaksi?</h3>
                <p className="text-gray-600 text-sm">"{deleteConfirm.keterangan}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="py-3 rounded-2xl border border-gray-300 hover:bg-gray-50 font-medium transition-colors">
                  Batal
                </button>
                <button
                  onClick={() => deleteMut.mutate(deleteConfirm.id)}
                  disabled={deleteMut.isPending}
                  className="py-3 rounded-2xl bg-red-600 text-white font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
                >
                  {deleteMut.isPending ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tambah */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  <DollarSign className="text-teal-600" size={26} /> Catat Transaksi
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-3 bg-gray-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => { setSelectedTipe('MASUK'); reset({ ...watch(), tipe: 'MASUK', metode: 'offline' }) }}
                    className={`flex-1 py-3.5 rounded-xl font-medium transition-all ${
                      selectedTipe === 'MASUK' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    + Masuk
                  </button>
                  <button
                    onClick={() => { setSelectedTipe('KELUAR'); reset({ ...watch(), tipe: 'KELUAR', metode: 'offline' }) }}
                    className={`flex-1 py-3.5 rounded-xl font-medium transition-all ${
                      selectedTipe === 'KELUAR' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    - Keluar
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Keterangan</label>
                    <input {...register('keterangan')} required placeholder="Contoh: Penjualan harian" className="w-full border border-gray-300 focus:border-teal-500 rounded-xl px-4 py-3.5 outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 font-medium">Nominal (Rp)</label>
                      <input type="number" {...register('jumlah', { valueAsNumber: true })} required placeholder="0" className="w-full border border-gray-300 focus:border-teal-500 rounded-xl px-4 py-3.5 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 font-medium">Tanggal</label>
                      <input type="date" {...register('tanggal')} required className="w-full border border-gray-300 focus:border-teal-500 rounded-xl px-4 py-3.5 outline-none transition-all" />
                    </div>
                  </div>

                  {selectedTipe === 'KELUAR' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2 font-medium">Metode Pembayaran</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['offline', 'online'].map(m => (
                            <label key={m} className={`py-3.5 text-center rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                              watch('metode') === m ? 'bg-orange-100 border-orange-300 text-orange-700' : 'border-gray-300 hover:border-gray-400'
                            }`}>
                              <input type="radio" {...register('metode')} value={m} className="hidden" />
                              {m === 'offline' ? 'Tunai / Transfer' : 'Online'}
                            </label>
                          ))}
                        </div>
                      </div>

                      {watch('metode') === 'online' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-orange-700">
                            <Info size={16} /> Estimasi Potongan
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-gray-700">
                              <span>Nominal</span> <span>Rp {jumlah.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-orange-700">
                              <span>Fee 35%</span> <span>- Rp {fee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="pt-3 border-t border-orange-100 flex justify-between font-medium text-teal-700">
                              <span>Netto</span> <span>Rp {netto.toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    disabled={mutation.isPending}
                    type="submit"
                    className={`w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-md ${
                      selectedTipe === 'MASUK' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-orange-600 hover:bg-orange-700'
                    } disabled:opacity-60`}
                  >
                    {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {reportOpen && report && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  <BarChart3 className="text-gray-700" size={26} /> Ringkasan
                </h2>
                <button onClick={() => setReportOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
                  {(['daily', 'weekly', 'monthly'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setReportPeriod(p)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        reportPeriod === p ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
                    <p className="text-xs text-teal-600 mb-1">Total Masuk</p>
                    <p className="text-2xl font-semibold text-teal-700">Rp {(report?.summary?.totalPenjualan || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                    <p className="text-xs text-orange-600 mb-1">Potongan Fee</p>
                    <p className="text-2xl font-semibold text-orange-700">Rp {(report?.summary?.totalPotongan || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <p className="text-xs text-red-600 mb-1">Total Keluar</p>
                    <p className="text-2xl font-semibold text-red-700">Rp {(report?.summary?.totalPengeluaran || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-teal-100 border border-teal-200 rounded-2xl p-5">
                    <p className="text-xs text-teal-700 mb-1">Bersih</p>
                    <p className="text-2xl font-semibold text-teal-800">Rp {(report?.summary?.pendapatanBersih || 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}