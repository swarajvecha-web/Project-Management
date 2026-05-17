import React, { useState, useEffect } from 'react';
import {
  Clock, Plus, Timer, Code, Bug, Settings, Pencil, Trash2,
} from 'lucide-react';
import AddTimesheetModal from './modals/AddTimesheet';
import DataTable from '../../components/common/DataTable';
import DropdownMenu from '../../components/common/DropdownMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

/* ── helpers ── */
function safeDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTypeIcon(type) {
  switch (type?.toLowerCase()) {
    case 'development': return <Code size={15} className="text-blue-400" />;
    case 'testing':     return <Bug  size={15} className="text-yellow-400" />;
    default:            return <Settings size={15} className="text-gray-400" />;
  }
}

function getTypeBadge(type) {
  const map = {
    development: 'bg-blue-500/10 text-blue-400',
    testing:     'bg-yellow-500/10 text-yellow-400',
  };
  const cls = map[type?.toLowerCase()] || 'bg-secondary text-muted-foreground';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${cls}`}>
      {getTypeIcon(type)} {type || 'Other'}
    </span>
  );
}

/* ── column definitions ── */
const COLUMNS = [
  { key: 'employee',    label: 'Employee',      width: '18%' },
  { key: 'taskProject', label: 'Task / Project', width: '22%' },
  { key: 'timeSpent',   label: 'Time Spent',    width: '13%', align: 'center' },
  { key: 'type',        label: 'Type',          width: '15%', align: 'center' },
  { key: 'notes',       label: 'Notes',         width: '20%' },
  { key: 'date',        label: 'Date',          width: '12%' },
  { key: 'actions',     label: 'Actions',       width: '10%', align: 'center' },
];

/* ── stat card ── */
function StatCard({ icon: Icon, iconClass, bgClass, label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-3 ${bgClass} rounded-lg`}>
        <Icon className={iconClass} size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-foreground leading-tight">{value}</h3>
      </div>
    </div>
  );
}

/* ── main component ── */
export default function Timesheets() {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [data, setData]                 = useState([]);
  const [stats, setStats]               = useState({ totalTimesheets: 0, developmentType: 0, testType: 0, otherType: 0 });
  const [loading, setLoading]           = useState(true);

  const getTimesheets = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get('api/timesheets');
      setData(res);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const { data: res } = await axios.get('api/timesheets-stats');
      setStats(res);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const refresh = () => { getTimesheets(); getStats(); };

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── map raw data → table rows ── */
  const rows = data.map((ts) => ({
    _key: ts._id,

    employee: (
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-atlassian-blue/20 border border-atlassian-blue/30 flex items-center justify-center text-xs font-bold text-atlassian-blue flex-shrink-0">
          {ts.employee?.firstName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="text-sm font-semibold text-foreground truncate">
          {ts.employee ? `${ts.employee.firstName} ${ts.employee.lastName}` : 'Unassigned'}
        </span>
      </div>
    ),

    taskProject: (
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {ts.task?.title || <span className="text-muted-foreground italic text-xs">No Task</span>}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {ts.project?.title || 'No Project'}
        </div>
      </div>
    ),

    timeSpent: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-bold whitespace-nowrap">
        <Clock size={13} className="text-muted-foreground" />
        {ts.timeSpent != null ? `${ts.timeSpent}h` : '—'}
      </span>
    ),

    type: getTypeBadge(ts.type),

    notes: (
      <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
        {ts.notes || <span className="italic text-xs opacity-60">No notes</span>}
      </p>
    ),

    date: (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {safeDate(ts.date)}
      </span>
    ),

    actions: (
      <div className="flex justify-center">
        <DropdownMenu
          horizontal
          actions={[
            {
              label: 'Edit',
              icon: Pencil,
              onClick: () => toast.info('Timesheet actions coming soon!'),
            },
            {
              label: 'Delete',
              icon: Trash2,
              color: 'text-red-500',
              onClick: () => toast.info('Timesheet actions coming soon!'),
            },
          ]}
        />
      </div>
    ),
  }));

  return (
    <div className="w-full">
      <AddTimesheetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); refresh(); }}
      />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="text-atlassian-blue" size={24} />
              Timesheets
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Log and track time spent on tasks and projects.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-atlassian-blue text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-medium text-sm shadow-sm"
          >
            <Plus size={16} /> Log Time
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Timer}    iconClass="text-atlassian-blue" bgClass="bg-atlassian-blue/10" label="Total Logs"    value={stats.totalTimesheets || 0} />
          <StatCard icon={Code}     iconClass="text-blue-400"       bgClass="bg-blue-500/10"       label="Development"  value={stats.developmentType || 0} />
          <StatCard icon={Bug}      iconClass="text-yellow-400"     bgClass="bg-yellow-500/10"     label="Testing"      value={stats.testType || 0}        />
          <StatCard icon={Settings} iconClass="text-gray-400"       bgClass="bg-gray-500/10"       label="Other"        value={stats.otherType || 0}       />
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={COLUMNS}
          rows={rows}
          loading={loading}
          emptyTitle="No timesheet logs yet"
          emptyMessage="Click 'Log Time' to record your first session."
          minRows={5}
        />

      </div>
    </div>
  );
}