import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserMinus, Users, ClipboardList, Upload } from 'lucide-react';

const api = axios.create({ baseURL: 'http://localhost:5000' });

const Admin = () => {
  const [form, setForm] = useState({ department: 'CSE', year: 'Year1', roll: '' });
  const [groupForm, setGroupForm] = useState({ department: 'CSE', year: 'Year1' });
  const [file, setFile] = useState<File | null>(null);
  const [attendance, setAttendance] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupForm({ ...groupForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await api.post('/admin/remove', form);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data.error || 'Remove failed');
    }
  };

  const handleAttendance = async () => {
    try {
      const res = await api.post('/admin/attendance', form);
      setAttendance(`${res.data.name}: ${res.data.attendance} attendances`);
      toast.info(`Attendance record retrieved for ${res.data.name}`);
    } catch (err: any) {
      toast.error(err.response?.data.error || 'Attendance fetch failed');
    }
  };

  const handleGroup = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('department', groupForm.department);
    formData.append('year', groupForm.year);

    try {
      const res = await api.post('/admin/group', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('Group attendance processed successfully');
      setAttendance(
        `Present: ${res.data.presentees.map((p: any) => p.name).join(', ')}\n` +
        `Absent: ${res.data.absentees.map((a: any) => a.name).join(', ')}`
      );
    } catch (err: any) {
      toast.error(err.response?.data.error || 'Group attendance failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <UserMinus className="h-8 w-8 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900 ml-3">Remove Student</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <SelectField
            name="department"
            label="Department"
            value={form.department}
            onChange={handleChange}
            options={[
              { value: 'CSE', label: 'Computer Science' },
              { value: 'IT', label: 'Information Technology' },
              { value: 'ECE', label: 'Electronics' },
              { value: 'Civil', label: 'Civil Engineering' },
            ]}
          />
          <SelectField
            name="year"
            label="Year"
            value={form.year}
            onChange={handleChange}
            options={[
              { value: 'Year1', label: 'First Year' },
              { value: 'Year2', label: 'Second Year' },
              { value: 'Year3', label: 'Third Year' },
              { value: 'Year4', label: 'Fourth Year' },
            ]}
          />
          <div className="flex items-end">
            <InputField
              name="roll"
              label="Roll Number"
              value={form.roll}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleRemove}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Remove Student
          </button>
          <button
            onClick={handleAttendance}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Check Attendance
          </button>
        </div>

        {attendance && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{attendance}</pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <Users className="h-8 w-8 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900 ml-3">Group Attendance</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SelectField
            name="department"
            label="Department"
            value={groupForm.department}
            onChange={handleGroupChange}
            options={[
              { value: 'CSE', label: 'Computer Science' },
              { value: 'IT', label: 'Information Technology' },
              { value: 'ECE', label: 'Electronics' },
              { value: 'Civil', label: 'Civil Engineering' },
            ]}
          />
          <SelectField
            name="year"
            label="Year"
            value={groupForm.year}
            onChange={handleGroupChange}
            options={[
              { value: 'Year1', label: 'First Year' },
              { value: 'Year2', label: 'Second Year' },
              { value: 'Year3', label: 'Third Year' },
              { value: 'Year4', label: 'Fourth Year' },
            ]}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Upload Group Photo</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGroup}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Users className="h-4 w-4 mr-2" />
            Process Group Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }: { label: string; [key: string]: any }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

const SelectField = ({
  label,
  options,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
  [key: string]: any;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      {...props}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default Admin;