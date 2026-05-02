"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, UserCheck, Clock, TrendingUp } from "lucide-react";

interface AdminStatsProps {
    totalDoctors: number;
    activeDoctors: number;
    totalAppointments: number;
    completedAppointments: number;
}

export default function AdminStats({
    activeDoctors,
    completedAppointments,
    totalAppointments,
    totalDoctors
}: AdminStatsProps) {
    
    const statCards = [
        { label: "Total Docteurs", value: totalDoctors, icon: <Users />, color: "bg-blue-500" },
        { label: "Docteurs Actifs", value: activeDoctors, icon: <UserCheck />, color: "bg-green-500" },
        { label: "Rendez-vous", value: totalAppointments, icon: <Calendar />, color: "bg-primary" },
        { label: "Terminés", value: completedAppointments, icon: <Clock />, color: "bg-purple-500" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -5 }}
                >
                    <Card className="relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-md hover:border-primary/50 transition-all duration-500 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                                        {stat.label}
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-3xl font-black italic">{stat.value}</h3>
                                        <TrendingUp className="size-3 text-green-500" />
                                    </div>
                                </div>
                                <div className={`size-14 ${stat.color} bg-opacity-10 rounded-2xl flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    {React.cloneElement(stat.icon as React.ReactElement, { className: "size-7" })}
                                </div>
                            </div>
                            
                            {/* Décoration de fond */}
                            <div className={`absolute -right-4 -bottom-4 size-24 ${stat.color} opacity-[0.03] rounded-full blur-3xl`} />
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

import React from 'react';
