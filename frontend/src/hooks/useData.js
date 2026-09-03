import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get('/projects');
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { projects, loading, refetch: fetch };
}

export function useProjectMembers(projectId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!projectId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/projects/${projectId}/members`);
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { members, loading, refetch: fetch };
}

export function useTasks(projectId) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/tasks/${projectId}`);
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (!user) return;
    fetch();
  }, [fetch, user]);

  return { tasks, loading, refetch: fetch };
}

export function useTaskComments(taskId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!taskId) {
      setComments([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/comments/${taskId}`);
      setComments(data.comments || []);
    } catch {
      setComments([]);
    }
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { comments, loading, refetch: fetch };
}

export function useActivityLogs(projectId, limit = 30) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!projectId) {
      setActivity([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get(`/activity/${projectId}?limit=${limit}`);
      setActivity(data.activity || []);
    } catch {
      setActivity([]);
    }
    setLoading(false);
  }, [projectId, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { activity, loading, refetch: fetch };
}

export function useAllUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get('/users')
      .then((data) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [user]);

  return { users, loading };
}

export function useTaskCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get('/tasks/counts')
      .then((data) => setCounts(data.counts))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  return { counts, loading };
}
