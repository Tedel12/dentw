"use client"

import AdminStats from '@/components/admin/AdminStats'
import DoctorsManagement from '@/components/admin/DoctorsManagement'
import DoctorValidationRequests from '@/components/admin/DoctorValidationRequests'
import RecentAppointments from '@/components/admin/RecentAppointments'
import Navbar from '@/components/Navbar'
import { useGetAppointments } from '@/hooks/use-appointment'
import { useGetDoctors } from '@/hooks/use-doctors'
import { useUser } from '@clerk/nextjs'
import { HeartPulse, ShieldCheck } from 'lucide-react'
import React from 'react'
import Link from 'next/link'

const AdminDashbardClient = () => {

  const { user } = useUser()
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctors();
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetAppointments();


  // calcul des statistiques à afficher dans le dashboard
  const stats = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter((doc: any) => doc.isActive).length,
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter((app: any) => app.status === "COMPLETED").length
  }

  if (doctorsLoading || appointmentsLoading) return <LoadingUI />

  return (
    <div className='min-h-screen bg-background'>
      
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        {/* ADMIN WELCOME SECTION */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-6 md:p-8 border border-primary/20">
          <div className="space-y-4 text-center md:text-left w-full md:w-auto">
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20'>
              <div className='w-2 h-2 bg-primary rounded-full animate-pulse'></div>
              <span className='text-sm font-medium text-primary'>Dashboard Admin</span>
            </div>
            <div>
              <h1 className='text-2xl md:text-4xl font-bold mb-2'>
                Content de te revoir, {user?.firstName || 'Admin'} !
              </h1>
              <p className='text-muted-foreground text-sm md:text-base'>
                Gérez les médecins et supervisez les rendez-vous de votre cabinet.
              </p>
              <div className='mt-4'>
                <Link href="/admin/audit" className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:bg-slate-800">
                    <ShieldCheck className='w-4 h-4 text-primary' />
                    Voir les Logs d'Audit
                </Link>
              </div>
            </div>
          </div>

          <div className='hidden lg:block'>
            <div className='w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center'>
              <HeartPulse className='w-16 h-16 text-primary' />
            </div>
          </div>
        </div>

        <AdminStats
          totalDoctors={stats.totalDoctors}
          activeDoctors={stats.activeDoctors}
          totalAppointments={stats.totalAppointments}
          completedAppointments={stats.completedAppointments}
        />

        <DoctorValidationRequests />

        <DoctorsManagement />

        <RecentAppointments />
      </div>
    </div>
  )
}

export default AdminDashbardClient


function LoadingUI () {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' />
            <p className='text-muted-foreground'>Chargement</p>
          </div>
        </div>
      </div>
    </div>
  )
}