import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { AppLayout } from '@/components/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { BoardPage } from '@/pages/BoardPage';
import { TeamPage } from '@/pages/TeamPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Layers } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [openProjectId, setOpenProjectId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 animate-pulse">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-slate-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  function navigate(page) {
    setCurrentPage(page);
    setOpenProjectId(null);
  }

  function openProject(projectId) {
    setOpenProjectId(projectId);
    setCurrentPage('board');
  }

  return (
    <AppLayout currentPage={currentPage} onNavigate={navigate}>
      {openProjectId && currentPage === 'board' ? (
        <BoardPage projectId={openProjectId} onBack={() => navigate('projects')} />
      ) : (
        <>
          {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} onOpenProject={openProject} />}
          {currentPage === 'projects' && <ProjectsPage onOpenProject={openProject} />}
          {currentPage === 'board' && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <Layers className="h-12 w-12 text-slate-300 mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No project selected</h2>
              <p className="text-sm text-slate-500 mb-4">Choose a project to view its board</p>
              <button
                onClick={() => navigate('projects')}
                className="text-sm font-medium text-slate-900 hover:underline"
              >
                Browse projects →
              </button>
            </div>
          )}
          {currentPage === 'team' && <TeamPage />}
          {currentPage === 'activity' && <ActivityPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </>
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
