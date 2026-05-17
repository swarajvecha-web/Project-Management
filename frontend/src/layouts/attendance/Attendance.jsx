import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Plus, Clock, UserCheck,
  CalendarCheck, User, Pencil, Trash2,
} from 'lucide-react';
import AddAttendanceModal from './modals/AddAttendance';
import DataTable from '../../components/common/DataTable';
import DropdownMenu from '../../components/common/DropdownMenu';
import axios from 'axios';
import { toast } from 'react-toastify';

/* ── helpers ── */
function safeDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function calcHours(timeIn, timeOut) {
  if (!timeIn || !timeOut) return null;
  const parse = (t) => {
    const cleaned = t.replace(/\s?(AM|PM)/i, '').trim();
    const [h, m] = cleaned.split(':').map(Number);
    const period = t.match(/PM/i) ? 'PM' : 'AM';
    let hours = h;
    if (period === 'PM' && h < 12) hours += 12;
    if (period === 'AM' && h === 12) hours = 0;
    return hours * 60 + (m || 0);
  };
  const diff = parse(timeOut) - parse(timeIn);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ── column definitions ── */
const COLUMNS = [
  { key: 'date',         label: 'Date',          width: '18%' },
  { key: 'employee',     label: 'Employee',       width: '20%' },
  { key: 'timeIn',       label: 'Time In',        width: '13%', align: 'center' },
  { key: 'timeOut',      label: 'Time Out',       width: '13%', align: 'center' },
  { key: 'workingHours', label: 'Working Hours',  width: '14%', align: 'center' },
  { key: 'status',       label: 'Status',         width: '12%', align: 'center' },
  { key: 'actions',      label: 'Actions',        width: '10%', align: 'center' },
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
export default function Attendance() {
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState(null);
  const [attendanceData, setAttendanceData]   = useState([]);
  const [loading, setLoading]                 = useState(true);

  const stats = {
    totalRecords: attendanceData.length,
    todayRecords: attendanceData.filter(r => {
      const d = new Date(r.day);
      return !isNaN(d) && d.toDateString() === new Date().toDateString();
    }).length,
    inProgress:   attendanceData.filter(r => !r.timeOut).length,
    completed:    attendanceData.filter(r =>  r.timeOut).length,
  };

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('api/attendances');
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendances:', err);
      toast.error('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendances(); }, []);

  /* ── Open edit modal ── */
  const handleEdit = (record) => {
    setAttendanceToEdit(record);
    setIsModalOpen(true);
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await axios.delete(`api/attendance/${id}`);
      toast.success('Attendance record deleted.');
      fetchAttendances();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  /* ── Modal close ── */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setAttendanceToEdit(null);
    fetchAttendances();
  };

  /* ── map raw records → table rows ── */
  const rows = attendanceData.map((rec) => {
    const hours = rec.workingHours
      ? rec.workingHours
      : calcHours(rec.timeIn, rec.timeOut);

    return {
      _key: rec._id,

      date: (
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {safeDate(rec.day)}
        </span>
      ),

      employee: (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-atlassian-blue/20 border border-atlassian-blue/30 flex items-center justify-center text-xs font-bold text-atlassian-blue flex-shrink-0">
            {rec.employee ? rec.employee.firstName?.[0]?.toUpperCase() : <User size={12} />}
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {rec.employee
              ? `${rec.employee.firstName} ${rec.employee.lastName}`
              : 'Unassigned'}
          </span>
        </div>
      ),

      timeIn: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 font-mono text-xs font-semibold whitespace-nowrap">
          {rec.timeIn || '—'}
        </span>
      ),

      timeOut: rec.timeOut ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 font-mono text-xs font-semibold whitespace-nowrap">
          {rec.timeOut}
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-muted-foreground font-mono text-xs whitespace-nowrap">—</span>
      ),

      workingHours: hours ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-foreground text-xs font-bold whitespace-nowrap">
          <Clock size={12} className="text-muted-foreground" /> {hours}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),

      status: rec.timeOut ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 whitespace-nowrap">
          Completed
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          In Progress
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
                onClick: () => handleEdit(rec),
              },
              {
                label: 'Delete',
                icon: Trash2,
                color: 'text-red-500',
                onClick: () => handleDelete(rec._id),
              },
            ]}
          />
        </div>
      ),
    };
  });

  return (
    <div className="w-full">
      <AddAttendanceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        attendanceToEdit={attendanceToEdit}
      />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="text-atlassian-blue" size={24} />
              Attendance Log
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor daily check-ins, check-outs, and working hours.
            </p>
          </div>
          <button
            onClick={() => { setAttendanceToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-atlassian-blue text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-medium text-sm shadow-sm"
          >
            <Plus size={16} /> Mark Attendance
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={CalendarCheck} iconClass="text-atlassian-blue" bgClass="bg-atlassian-blue/10" label="Total Records"    value={stats.totalRecords} />
          <StatCard icon={UserCheck}     iconClass="text-green-500"      bgClass="bg-green-500/10"      label="Today's Logs"     value={stats.todayRecords} />
          <StatCard icon={Clock}         iconClass="text-yellow-500"     bgClass="bg-yellow-500/10"     label="Currently In"     value={stats.inProgress}   />
          <StatCard icon={Clock}         iconClass="text-purple-400"     bgClass="bg-purple-400/10"     label="Completed Shifts" value={stats.completed}    />
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={COLUMNS}
          rows={rows}
          loading={loading}
          emptyTitle="No attendance records yet"
          emptyMessage="Click 'Mark Attendance' to log the first entry."
          minRows={5}
        />

      </div>
    </div>
  );
}