import React, { useState, useEffect } from 'react';
import {
  Users, Plus, UserCheck, UserMinus, UserX, Edit2, Trash2,
} from 'lucide-react';
import AddEmployeeModal from './modals/AddEmployee';
import DataTable from '../../components/common/DataTable';
import DropdownMenu from '../../components/common/DropdownMenu';
import Avatar from '../../components/common/Avatar';
import axios from 'axios';
import { toast } from 'react-toastify';

/* ── helpers ── */
function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case 'active':      return 'bg-green-500/10 text-green-400 border border-green-500/20';
    case 'in active':   return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    case 'terminated':  return 'bg-red-500/10 text-red-400 border border-red-500/20';
    default:            return 'bg-secondary text-muted-foreground border border-border';
  }
}

/* ── column definitions ── */
const COLUMNS = [
  { key: 'employee', label: 'Employee',  width: '30%' },
  { key: 'idCnic',   label: 'ID / CNIC', width: '22%' },
  { key: 'role',     label: 'Role',      width: '20%' },
  { key: 'status',   label: 'Status',    width: '16%', align: 'center' },
  { key: 'actions',  label: 'Actions',   width: '12%', align: 'center' },
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
export default function Employees() {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeesData, setEmployeesData]   = useState([]);
  const [stats, setStats]               = useState({
    totalEmployees: 0, activeEmployees: 0, inActiveEmployees: 0, terminatedEmployees: 0,
  });
  const [loading, setLoading] = useState(true);

  const getEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('api/employees');
      setEmployeesData(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const { data } = await axios.get('api/employees-stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const refresh = () => { getEmployees(); getStats(); };

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`api/employee/${id}`);
      toast.success('Employee deleted successfully');
      refresh();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete employee');
    }
  };

  const openEdit = (emp) => {
    setEmployeeToEdit(emp);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmployeeToEdit(null);
    refresh();
  };

  /* ── map raw data → table rows ── */
  const rows = employeesData.map((emp) => ({
    _key: emp._id,

    employee: (
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          src={emp.profilePic}
          name={`${emp.firstName} ${emp.lastName}`}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {emp.firstName} {emp.lastName}
          </div>
          <div className="text-xs text-muted-foreground truncate">{emp.email}</div>
        </div>
      </div>
    ),

    idCnic: (
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{emp.employee_id || '—'}</div>
        <div className="text-xs text-muted-foreground font-mono">{emp.cnic || '—'}</div>
      </div>
    ),

    role: (
      <span className="text-sm text-foreground capitalize">{emp.role || '—'}</span>
    ),

    status: (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusStyle(emp.status)}`}>
        {emp.status || 'Active'}
      </span>
    ),

    actions: (
      <div className="flex justify-center">
        <DropdownMenu
          horizontal
          actions={[
            { label: 'Edit',   icon: Edit2,  onClick: () => openEdit(emp) },
            { label: 'Delete', icon: Trash2, color: 'text-red-500', onClick: () => handleDelete(emp._id) },
          ]}
        />
      </div>
    ),
  }));

  return (
    <div className="w-full">
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        employeeToEdit={employeeToEdit}
      />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="text-atlassian-blue" size={24} />
              Employee Directory
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage team members, roles, and access.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-atlassian-blue text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all font-medium text-sm shadow-sm"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}     iconClass="text-atlassian-blue" bgClass="bg-atlassian-blue/10" label="Total"       value={stats.totalEmployees || 0}      />
          <StatCard icon={UserCheck} iconClass="text-green-500"      bgClass="bg-green-500/10"      label="Active"      value={stats.activeEmployees || 0}     />
          <StatCard icon={UserMinus} iconClass="text-yellow-500"     bgClass="bg-yellow-500/10"     label="Inactive"    value={stats.inActiveEmployees || 0}   />
          <StatCard icon={UserX}     iconClass="text-red-400"        bgClass="bg-red-500/10"        label="Terminated"  value={stats.terminatedEmployees || 0} />
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={COLUMNS}
          rows={rows}
          loading={loading}
          emptyTitle="No employees yet"
          emptyMessage="Click 'Add Employee' to onboard the first team member."
          minRows={5}
        />

      </div>
    </div>
  );
}