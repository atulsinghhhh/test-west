import React from 'react';
import { Trophy, Clock, Target, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
    // Mock data for now, can be replaced with API call later
    const stats = [
        { label: 'Papers Attempted', value: '12', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Average Score', value: '85%', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Practice Questions', value: '150+', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Study Hours', value: '24h', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Welcome back, Student!</h1>
                <p className="text-[var(--color-muted-foreground)] mt-2">Here's an overview of your learning progress.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[var(--color-muted-foreground)] text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-[var(--color-foreground)] mt-2 group-hover:text-[var(--color-primary)] transition-colors">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity & Performance Chart Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">Performance Analysis</h3>
                        <TrendingUp className="text-[var(--color-primary)] w-5 h-5" />
                    </div>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-[var(--color-admin-border)] rounded-lg text-[var(--color-muted-foreground)]">
                        Chart Visualization Coming Soon
                    </div>
                </div>

                <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-admin-border)]">
                    <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--color-admin-hover)] transition-colors cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-foreground)]">Attempted "Physics Chapter 1"</p>
                                    <p className="text-xs text-[var(--color-muted-foreground)]">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

import { FileText } from 'lucide-react'; // Import missing icon

export default StudentDashboard;
