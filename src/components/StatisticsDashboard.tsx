"use client";

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  ScatterController
} from 'chart.js';
import { Bar, Doughnut, Scatter } from 'react-chartjs-2';
import { Tag, MonitorSmartphone, MessageSquare, Star, Eye, Hash, Trophy } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  ScatterController
);

export interface ItemStats {
  id: number;
  name: string;
  views: number;
  avgRating: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  type?: string | null;
  classificationId?: number | null;
}

interface StatisticsDashboardProps {
  classificationsStats: ItemStats[];
  softwareStats: ItemStats[];
  debatesStats: ItemStats[];
}

export function StatisticsDashboard({ classificationsStats, softwareStats, debatesStats }: StatisticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'software' | 'classifications' | 'debates'>('software');
  const [softwareType, setSoftwareType] = useState<string>('');
  const [softwareClassification, setSoftwareClassification] = useState<string>('');

  const getActiveData = () => {
    switch (activeTab) {
      case 'classifications': return classificationsStats;
      case 'software': 
      case 'debates': {
        let data = activeTab === 'software' ? [...softwareStats] : [...debatesStats];
        if (softwareType) {
          data = data.filter(d => d.type === softwareType);
        }
        if (softwareClassification) {
          data = data.filter(d => d.classificationId === Number(softwareClassification));
        }
        return data;
      }
    }
  };

  const data = getActiveData().sort((a, b) => b.views - a.views); // Sort by views desc by default

  const totalItems = data.length;
  const totalViews = data.reduce((acc, item) => acc + item.views, 0);
  const avgRatingOverall = data.length ? (data.reduce((acc, item) => acc + item.avgRating, 0) / data.length).toFixed(1) : "0.0";
  const bestItem = data.length ? [...data].sort((a, b) => b.avgRating - a.avgRating)[0] : null;

  // Chart 1: Vertical Bar - Views per item
  const viewsBarData = {
    labels: data.map(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name),
    datasets: [
      {
        label: 'Vistas',
        data: data.map(d => d.views),
        backgroundColor: '#2dd4bf', // teal-400
        borderRadius: 6,
      }
    ]
  };

  const viewsBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 45 } }
    }
  };

  // Chart 2: Doughnut - Rating distribution
  const totalR1 = data.reduce((acc, d) => acc + d.rating1, 0);
  const totalR2 = data.reduce((acc, d) => acc + d.rating2, 0);
  const totalR3 = data.reduce((acc, d) => acc + d.rating3, 0);
  const totalR4 = data.reduce((acc, d) => acc + d.rating4, 0);
  const totalR5 = data.reduce((acc, d) => acc + d.rating5, 0);

  const doughnutData = {
    labels: ['1★', '2★', '3★', '4★', '5★'],
    datasets: [
      {
        data: [totalR1, totalR2, totalR3, totalR4, totalR5],
        backgroundColor: ['#ef4444', '#f97316', '#737373', '#10b981', '#6366f1'], // red, orange, gray, emerald, indigo
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#94a3b8', usePointStyle: true, padding: 20 } }
    },
    cutout: '70%',
  };

  // Chart 3: Scatter Plot - Views vs Rating
  const scatterData = {
    datasets: [{
      label: 'Artículos',
      data: data.map(d => ({ x: d.views, y: d.avgRating, name: d.name })),
      backgroundColor: '#8b5cf6', // violet-500
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const point = context.raw;
            return `${point.name}: ${point.x} vistas, ${point.y.toFixed(1)} ★`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Vistas', color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        min: 1, max: 5,
        title: { display: true, text: 'Rating', color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  // Chart 4: Horizontal Bar - Avg Rating per item
  const ratingDataSorted = [...data].sort((a, b) => b.avgRating - a.avgRating);
  const horizontalBarData = {
    labels: ratingDataSorted.map(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name),
    datasets: [{
      label: 'Rating Promedio',
      data: ratingDataSorted.map(d => d.avgRating),
      backgroundColor: ratingDataSorted.map(d => d.avgRating >= 4 ? '#10b981' : d.avgRating >= 3 ? '#f59e0b' : '#ef4444'),
      borderRadius: 4,
    }]
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { min: 0, max: 5, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-card p-1.5 rounded-xl border border-border inline-flex">
          <button
            onClick={() => setActiveTab('software')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'software' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <MonitorSmartphone className="w-4 h-4" /> Catálogo de Software
          </button>
          <button
            onClick={() => setActiveTab('classifications')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'classifications' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <Tag className="w-4 h-4" /> Clasificaciones
          </button>
          <button
            onClick={() => setActiveTab('debates')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'debates' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <MessageSquare className="w-4 h-4" /> Foros de Debate
          </button>
        </div>

        {(activeTab === 'software' || activeTab === 'debates') && (
          <div className="flex gap-4 items-center">
            <select
              value={softwareType}
              onChange={(e) => setSoftwareType(e.target.value)}
              className="bg-card border border-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Todos los Tipos</option>
              <option value="App">App</option>
              <option value="Librería">Librería</option>
              <option value="Modelo">Modelo</option>
            </select>

            <select
              value={softwareClassification}
              onChange={(e) => setSoftwareClassification(e.target.value)}
              className="bg-card border border-border rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Todas las Clasificaciones</option>
              {classificationsStats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Artículos</p>
            <Hash className="w-4 h-4 text-muted-foreground/50" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalItems}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Vistas Totales</p>
            <Eye className="w-4 h-4 text-teal-500/50" />
          </div>
          <p className="text-3xl font-bold text-teal-400">
            {totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Rating Promedio</p>
            <Star className="w-4 h-4 text-yellow-500/50" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">{avgRatingOverall} ★</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Mejor Valorado</p>
            <Trophy className="w-4 h-4 text-violet-500/50" />
          </div>
          <p className="text-xl font-bold text-foreground truncate" title={bestItem?.name || 'N/A'}>
            {bestItem?.name || 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{bestItem ? `${bestItem.avgRating.toFixed(1)} ★` : '-'}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-1">Vistas por Artículo</h3>
          <p className="text-xs text-muted-foreground mb-6">Los más visitados de la sección</p>
          <div className="relative h-64 w-full">
            <Bar data={viewsBarData} options={viewsBarOptions} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-1">Distribución de Calificaciones</h3>
          <p className="text-xs text-muted-foreground mb-6">Frecuencia de estrellas de 1 a 5</p>
          <div className="relative h-64 w-full flex justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-1">Vistas vs Rating</h3>
          <p className="text-xs text-muted-foreground mb-6">Relación entre popularidad y calidad percibida</p>
          <div className="relative h-72 w-full">
            <Scatter data={scatterData} options={scatterOptions} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-1">Rating Promedio</h3>
          <p className="text-xs text-muted-foreground mb-6">Comparativa de puntajes</p>
          <div className="relative h-72 w-full">
            <Bar data={horizontalBarData} options={horizontalBarOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
