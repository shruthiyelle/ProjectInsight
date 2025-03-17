import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserPlus, Camera } from 'lucide-react';
import Webcam from 'react-webcam';

const api = axios.create({ baseURL: 'http://localhost:5000' });

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    roll: '',
    division: '',
    department: 'CSE',
    year: 'Year1',
    email: '',
  });
  const [showCapture, setShowCapture] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/register', form);
      toast.success(res.data.message);
      setShowCapture(true);
    } catch (err: any) {
      toast.error(err.response?.data.error || 'Registration failed');
    }
  };

  const startWebcam = () => {
    setIsWebcamActive(true);
    toast.success('Webcam started successfully');
  };

  const stopWebcam = () => {
    setIsWebcamActive(false);
  };

  const handleCapture = async () => {
    if (!isWebcamActive) {
      startWebcam();
      return;
    }

    if (!webcamRef.current) {
      toast.error('Webcam not ready');
      return;
    }

    const imageDataUrl = webcamRef.current.getScreenshot();
    if (!imageDataUrl) {
      console.error('Failed to capture image');
      toast.error('Failed to capture image');
      return;
    }

    console.log('Captured image data URL length:', imageDataUrl.length);
    const imageData = imageDataUrl.split(',')[1]; // Base64 without prefix

    try {
      const res = await api.post('/capture', {
        department: form.department,
        year: form.year,
        roll: form.roll,
        image: imageData,
      });
      toast.success(res.data.message);
      stopWebcam();
      setShowCapture(false);
    } catch (err: any) {
      console.error('Capture error:', err.response?.data);
      toast.error(err.response?.data.error || 'Capture failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center mb-8">
        <UserPlus className="h-8 w-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900 ml-3">Student Registration</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField name="name" label="Full Name" value={form.name} onChange={handleChange} required />
          <InputField name="roll" label="Roll Number" value={form.roll} onChange={handleChange} required />
          <InputField name="division" label="Division" value={form.division} onChange={handleChange} required />
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
          <InputField
            name="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Register
          </button>
        </div>
      </form>

      {showCapture && (
        <div className="mt-8 space-y-4">
          {isWebcamActive && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              width={640}
              height={480}
              className="w-full max-w-md mx-auto rounded-md shadow-md"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
            />
          )}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCapture}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Camera className="h-5 w-5 mr-2" />
              {isWebcamActive ? 'Capture Face' : 'Start Webcam'}
            </button>
            {isWebcamActive && (
              <button
                onClick={stopWebcam}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Stop Webcam
              </button>
            )}
          </div>
        </div>
      )}
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

export default Register;