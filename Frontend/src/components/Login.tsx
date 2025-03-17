import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserCheck, Loader, Camera } from 'lucide-react';
import Webcam from 'react-webcam';

const api = axios.create({ baseURL: 'http://localhost:5000' });

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('Year1');
  const [userDetails, setUserDetails] = useState(null); // State to store user details
  const webcamRef = useRef<Webcam>(null);

  const startWebcam = () => {
    setIsWebcamActive(true);
    toast.success('Webcam started successfully');
  };

  const stopWebcam = () => {
    setIsWebcamActive(false);
    setUserDetails(null); // Reset user details when stopping webcam
  };

  const handleLogin = async () => {
    if (!isWebcamActive) {
      startWebcam();
      return;
    }

    if (!webcamRef.current) {
      toast.error('Webcam not ready');
      return;
    }

    setLoading(true);
    try {
      const imageDataUrl = webcamRef.current.getScreenshot();
      if (!imageDataUrl) {
        toast.error('Failed to capture image');
        setLoading(false);
        return;
      }

      const imageData = imageDataUrl.split(',')[1]; // Base64 without prefix
      console.log('Captured image data URL length:', imageDataUrl.length);

      const res = await api.post('/login', {
        department,
        year,
        image: imageData,
      });

      if (res.data.user) {
        toast.success(`Welcome back, ${res.data.user.name}!`);
        setUserDetails(res.data.user); // Store user details to display
        setIsWebcamActive(false); // Stop the webcam after successful login
      } else {
        toast.success(res.data.message);
      }
    } catch (err: any) {
      console.error('Login error:', err.response?.data);
      toast.error(err.response?.data.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-center">
        <UserCheck className="h-12 w-12 text-indigo-600 mx-auto" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Face Recognition Login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Click the button below to start face recognition
        </p>
      </div>

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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="CSE">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="ECE">Electronics</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Year1">First Year</option>
              <option value="Year2">Second Year</option>
              <option value="Year3">Third Year</option>
              <option value="Year4">Fourth Year</option>
            </select>
          </div>
        </div>

        {userDetails && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
            <div className="mt-2 space-y-1">
              <p><strong>Name:</strong> {userDetails.name}</p>
              <p><strong>Roll:</strong> {userDetails.roll}</p>
              <p><strong>Division:</strong> {userDetails.division}</p>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Time:</strong> {userDetails.time}</p>
              <p><strong>Attendance Count:</strong> {userDetails.attendance_count}</p>
              <p><strong>Last Attendance:</strong> {userDetails.last_attendance_time}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                {isWebcamActive ? 'Login with Face' : 'Start Webcam'}
              </>
            )}
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
    </div>
  );
};

export default Login;