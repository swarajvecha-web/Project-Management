import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

function Burndown() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBurndown = async () => {
      try {
        const response = await axios.get('api/tasks');
        const tasks = response.data || [];
        
        const totalPoints = tasks.reduce((sum, t) => sum + (Number(t.storyPoints) || 0), 0);
        
        // Generate 7 days ending today dynamically
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(23, 59, 59, 999);
          
          let remainingForDay = totalPoints;
          
          // Subtract points for tasks that were completed on or before this day
          tasks.forEach(task => {
            if (task.status === 'Done') {
               const updated = new Date(task.updatedAt || task.createdAt || new Date());
               if (updated <= date) {
                 remainingForDay -= (Number(task.storyPoints) || 0);
               }
            }
          });

          // Ideal logic: straight line from total to 0 over 7 days
          const ideal = Math.max(0, totalPoints - (totalPoints / 7) * (7 - i));

          chartData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            ideal: Math.round(ideal),
            actual: remainingForDay
          });
        }

        setData(chartData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBurndown();
  }, []);

  return (
    <div className="flex flex-col h-full bg-background rounded-md p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Burndown Chart</h1>
        <p className="text-sidebar-foreground mt-2">Active Sprint: Dynamic View (Last 7 Days)</p>
      </div>

      <div className="flex-1 min-h-[400px] bg-sidebar border border-border p-6 rounded-lg">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DFE1E6" />
              <XAxis dataKey="day" stroke="#9FADBC" />
              <YAxis stroke="#9FADBC" />
              <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="ideal" name="Ideal Burndown" stroke="#9FADBC" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="actual" name="Actual Remaining" stroke="#2684FF" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
             No data available for burndown.
          </div>
        )}
      </div>
    </div>
  );
}

export default Burndown;
