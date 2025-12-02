import api from '../services/api';
import {useNavigate} from "react-router-dom"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AccountCircle, ChatBubbleOutline, Close, DeleteOutline, EditOutlined, Flag, FlagOutlined, GroupAdd, Image, Logout, ScheduleOutlined, ThumbUpOutlined, Visibility , Email , People , RssFeed , SpeakerNotes , Warning , Lock } from '@mui/icons-material';
// --- Icon Imports (using inline SVG for single-file mandate) ---
const LayoutDashboard = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="3" y="14" rx="1" /><rect width="7" height="5" x="14" y="14" rx="1" /></svg>
);
const Users = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const Globe = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0-4-10 15.3 15.3 0 0 0 4-10z" /><path d="M2 12h20" /></svg>
);
const Edit = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
);
const Sun = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" /></svg>
);
const Moon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
const LogOut = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

// --- Constants ---
const VIEWS = {
  DASHBOARD: 'Dashboard',
  USERS: 'Users',
  COMMUNITIES: 'Communities',
};



// =======================================================
// UTILS
// =======================================================

const formatNumber = (num) => new Intl.NumberFormat().format(num);

// Theme Configuration Utility
const getThemeClasses = (theme) => {
  const isDark = theme === 'dark';
  return {
    // Main backgrounds and text
    background: isDark ? 'bg-gray-950' : 'bg-white',
    text: isDark ? 'text-white' : 'text-gray-900',

    // Sidebar
    sidebarBg: isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-gray-50 border-r border-gray-200',
    sidebarText: isDark ? 'text-white' : 'text-gray-900',
    sidebarItemHover: isDark ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-blue-100 hover:text-blue-800',
    sidebarItemActive: 'bg-blue-600 text-white font-semibold shadow-md', // Primary Blue

    // Card/Panel background and border
    cardBg: isDark ? 'bg-gray-800' : 'bg-white',
    cardBorder: isDark ? 'border-gray-700' : 'border-gray-200',

    // Table colors
    tableHeadBg: isDark ? 'bg-gray-700' : 'bg-blue-50',
    tableHeadText: isDark ? 'text-gray-300' : 'text-blue-700',
    tableRowHover: isDark ? 'hover:bg-gray-750' : 'hover:bg-blue-50',
    tableDivider: isDark ? 'divide-gray-700' : 'divide-gray-200',
    tableBodyText: isDark ? 'text-white' : 'text-gray-700',

    // Form inputs
    inputBg: isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
    inputText: isDark ? 'text-white' : 'text-gray-900',
    focusRing: 'focus:ring-blue-500 focus:border-blue-500', // Primary Blue focus

    // Primary Blue
    primaryBg: 'bg-blue-600',
    primaryHoverBg: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    primaryHoverText: 'hover:text-blue-500',

    // Chart color
    chartColor: '#3b82f6', // blue-500
  };
};

// =======================================================
// COMPONENTS
// =======================================================

// --- Dark Mode Toggle Switch ---
const ThemeToggle = ({ theme, toggleTheme }) => {
  const isDark = theme === 'dark';
  const primaryColor = 'bg-blue-600';

  return (
    <button
      onClick={toggleTheme}
      // Increased padding on button for a larger click target
      className={`flex items-center justify-between p-2 rounded-lg w-full transition-colors duration-200 
        ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }
      `}
    >
      <span className="font-medium text-sm">Dark Theme</span>
      
      {/* Toggle Track (Now Relative) */}
      <div 
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 relative overflow-hidden
          ${isDark ? primaryColor : 'bg-gray-300'}`}
      >
        
        {/* Sun Icon (Absolute Left) */}
        <Sun 
          className={`w-4 h-4 absolute left-1 transition-opacity duration-300 
            ${isDark ? 'opacity-100 text-white' : 'opacity-0 text-gray-600'}
          `}
        />

        {/* Moon Icon (Absolute Right) */}
        <Moon 
          className={`w-4 h-4 absolute right-1 transition-opacity duration-300 
            ${isDark ? 'opacity-0 text-gray-600' : 'opacity-100 text-white'}
          `}
        />

        {/* Toggle Circle (The moving thumb) */}
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 absolute 
            ${isDark ? 'translate-x-[1.25rem]' : 'translate-x-0'} 
          `}
        ></div>
        
      </div>
    </button>
  );
};

// --- Card Component ---
const StatCard = ({ title, value, icon, trend, colorClass, themeClasses }) => (
  <div className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border-b-4 ${colorClass} ${themeClasses.cardBorder}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${themeClasses.isDark ? 'text-gray-400' : 'text-gray-500'} uppercase`}>{title}</p>
        <p className={`text-3xl font-bold ${themeClasses.text} mt-1`}>{formatNumber(value)}</p>
      </div>
      {icon}
    </div>
    {trend && (
      <p className={`text-sm mt-3 ${themeClasses.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="font-semibold text-green-500">{trend}</span> vs last week
      </p>
    )}
  </div>
);



const EditUserModal = ({ user, onClose, onSave, themeClasses }) => {
  const [formData, setFormData] = useState({
    role: user.role,
    isActive: user.isActive,
    bio: user.bio || '', // Initialize bio
    joinedCommunities: user.joinedCommunities || [],
  });

  const [availableCommunities, setAvailableCommunities] = useState([]);

  const getAllCommunities = async () => {
    try {
      const resp = await api.get("http://localhost:3001/api/v1/admin/communities");
      console.log("resp from communities", resp)
      setAvailableCommunities(resp.data.data)
    } catch (error) {
      console.log("error while fetching commmunities", error)
    }
  }
  useEffect(() => {
    getAllCommunities();
  }, [onClose])

  const [communitiesToRemove, setCommunitiesToRemove] = useState([]);
  const [communitiesToAdd, setCommunitiesToAdd] = useState([]);

  const isDark = themeClasses.isDark;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Filter available communities to only show those the user hasn't joined/isn't being added to
  const availableToJoin = useMemo(() => {
    const joinedIds = new Set([
      ...formData.joinedCommunities.map(c => c._id),
      ...communitiesToAdd,
    ]);

    return availableCommunities.filter(comm => !joinedIds.has(comm._id));
  }, [availableCommunities, formData.joinedCommunities, communitiesToAdd]);


  const handleRemoveCommunity = (communityId) => {
    // 1. Add ID to removal list
    setCommunitiesToRemove(prev =>
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );

    // 2. Optimistically remove it from the displayed joined list
    setFormData(prev => ({
      ...prev,
      joinedCommunities: prev.joinedCommunities.filter(c => c._id !== communityId),
    }));
  };

  const handleAddCommunity = (communityId) => {
    // Add ID to addition list
    setCommunitiesToAdd(prev => [...prev, communityId]);

    // Optimistically add it to the displayed joined list (for visual feedback)
    const communityToAddDetails = availableCommunities.find(c => c._id === communityId);
    if (communityToAddDetails) {
      setFormData(prev => ({
        ...prev,
        joinedCommunities: [...prev.joinedCommunities, communityToAddDetails]
      }));
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      role: formData.role,
      isActive: formData.isActive,
      bio: formData.bio,
      communitiesToRemove: communitiesToRemove,
      communitiesToAdd: communitiesToAdd,
    };

    onSave(user._id, finalData);
  };

  const hasCommunities = formData.joinedCommunities && formData.joinedCommunities.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[95vh] transform transition-all duration-300`}>

        {/* --- Header & Profile Image --- */}
        <div className="flex items-center space-x-4 border-b pb-4 mb-6">
          <img
            src={`http://localhost:3001/${user.profileImage}` || 'https://via.placeholder.com/100?text=No+Image'} // Fallback placeholder
            alt={`${user.username}'s profile`}
            className="w-16 h-16 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
          <div>
            <h2 className={`text-3xl font-extrabold ${themeClasses.text}`}>
              {user.username}
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`ml-auto p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
            title="Close"
          >
            <Close />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* --- CORE USER SETTINGS & BIO --- */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* Role Selection */}
            <div className="col-span-1">
              <label className={`block text-sm font-semibold ${themeClasses.text} mb-2`}>Update Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full p-3 ${themeClasses.inputBg} rounded-xl ${themeClasses.inputText} ${themeClasses.focusRing} border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            {/* Account Status */}
            <div className="col-span-1 flex flex-col justify-end pb-1">
              <label className={`block text-sm font-semibold ${themeClasses.text} mb-2`}>Account Status</label>
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isActive" className={`ml-3 text-base font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formData.isActive ? 'Active' : 'Suspended'}
                </label>
              </div>
            </div>
          </div>

          {/* Bio Field */}
          <div className="mb-8">
            <label className={`block text-sm font-semibold ${themeClasses.text} mb-2`}>Bio (Optional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Enter a brief bio for the user..."
              className={`w-full p-3 ${themeClasses.inputBg} rounded-xl ${themeClasses.inputText} ${themeClasses.focusRing} border ${isDark ? 'border-gray-600' : 'border-gray-300'} resize-none`}
            />
          </div>

          <div className={`my-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>

          {/* --- COMMUNITY MANAGEMENT --- */}

          {/* Joined Communities (Removal) */}
          <h3 className={`text-xl font-bold ${themeClasses.text} mb-4 flex justify-between items-center`}>
            Joined Communities
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${themeClasses.primaryBg} text-white`}>
              {formData.joinedCommunities.length}
            </span>
          </h3>

          <div className={`max-h-48 overflow-y-auto border rounded-xl p-3 mb-6 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
            {!hasCommunities ? (
              <p className={`text-sm italic p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This user is not currently a member of any community.
              </p>
            ) : (
              <ul className="space-y-2">
                {formData.joinedCommunities.map((comm) => (
                  <li
                    key={comm._id}
                    className={`flex justify-between items-center p-3 rounded-lg transition duration-150 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <span className={`${themeClasses.text} font-medium flex items-center`}>
                      {comm.name}
                      {communitiesToRemove.includes(comm._id) && (
                        <span className="ml-2 text-xs text-red-500 font-semibold">(Pending Removal)</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCommunity(comm._id)}
                      className={`text-red-500 hover:text-white transition duration-150 p-1 rounded-full ${communitiesToRemove.includes(comm._id) ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-red-100 dark:hover:bg-red-900'}`}
                      title={communitiesToRemove.includes(comm._id) ? "Undo Remove" : `Remove user from ${comm.name}`}
                    >
                      <Close sx={{ fontSize: 18 }} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Communities to Add */}
          <div className="mb-6">
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>
              Add to Community
            </h3>

            <div className={`max-h-32 overflow-y-auto border rounded-xl p-3 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              {availableToJoin.length === 0 ? (
                <p className={`text-sm italic p-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  User is a member of all available communities.
                </p>
              ) : (
                <ul className="space-y-2">
                  {availableToJoin.map(comm => (
                    <li
                      key={comm._id}
                      className={`flex justify-between items-center p-3 rounded-lg transition duration-150 ${isDark ? 'bg-gray-800 hover:bg-green-900' : 'bg-white hover:bg-green-50'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <span className={`${themeClasses.text} font-medium`}>{comm.name}</span>
                      <button
                        type="button"
                        onClick={() => handleAddCommunity(comm._id)}
                        className="text-green-500 hover:text-white hover:bg-green-600 transition duration-150 p-1 rounded-full bg-green-100 dark:bg-green-800"
                        title={`Add user to ${comm.name}`}
                      >
                        <GroupAdd sx={{ fontSize: 18 }} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Note: Setting role to 'Moderator' grants moderator privileges in the communities added above.
            </p>
          </div>


          {/* --- Action Buttons --- */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded-xl transition duration-150 shadow-md font-semibold`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 ${themeClasses.primaryBg} text-white font-semibold rounded-xl ${themeClasses.primaryHoverBg} transition duration-150 shadow-lg`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =======================================================
// VIEWS
// =======================================================



// Utility to format time for the activity log
const formatTimeAgo = (dateString) => {
  const diff = new Date() - new Date(dateString);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

const getActivityIconAndColor = (type) => {
  let IconComponent;
  let colorClass; // Tailwind text color class

  switch (type) {
    case 'otp':
    case 'welcome':
      IconComponent = Email;
      colorClass = 'text-blue-500'; // Primary Blue
      break;
    case 'community':
    case 'COMMUNITY_INVITE':
      IconComponent = People;
      colorClass = 'text-green-500'; // Success Green
      break;
    case 'post':
      IconComponent = RssFeed;
      colorClass = 'text-yellow-500'; // Warning Yellow
      break;
    case 'comment':
      IconComponent = SpeakerNotes;
      colorClass = 'text-indigo-500'; // Info Indigo
      break;
    case 'info':
      IconComponent = Flag; // Could signify a generic alert
      colorClass = 'text-teal-500';
      break;
    case 'warning':
      IconComponent = Warning;
      colorClass = 'text-red-500'; // Critical Red
      break;
    default:
      IconComponent = Lock; // Generic fallback icon
      colorClass = 'text-gray-500';
      break;
  }
  return { IconComponent, colorClass };
};

// --- New Component 1: Recent Activity Log ---
const RecentActivityCard = ({ activity, themeClasses }) => {
  const isDark = themeClasses.isDark;

  return (
    <div className={`${themeClasses.cardBg} p-8 rounded-xl shadow-lg border ${themeClasses.cardBorder}`}>
      <h3 className={`text-xl font-semibold ${themeClasses.text} mb-6  flex items-center`}>
        <ScheduleOutlined sx={{ fontSize: 32 }} className="mr-2 text-blue-500" />
        Recent Site Activity
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar spacing */}
        {activity.map((item) => {
          // Determine the icon and primary color based on the notification type
          const { IconComponent, colorClass } = getActivityIconAndColor(item.type);
          
          // Display the username if populated, otherwise use a placeholder
          const username = item.user && item.user.username ? item.user.username : 'System';

          return (
            <div
              key={item._id}
              className={`flex items-start p-3 rounded-xl transition-colors duration-150 ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-100'} border-l-4 ${colorClass.replace('text-', 'border-')}`} // Added border-left for visual flair
            >
              
              {/* 🚀 FIXED ICON AREA */}
              <div className={`p-2 rounded-full mr-3 ${colorClass.replace('text-', 'bg-')} bg-opacity-10`}>
                <IconComponent sx={{ fontSize: 18 }} className={colorClass} />
              </div>

              <div className="flex-1 min-w-0">
                {/* 🚀 NEW: Title and User Context */}
                <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${themeClasses.text} truncate`}>
                        {item.title}
                    </p>
                    {/* User who triggered the activity */}
                    <span className={`text-xs ml-2 ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline cursor-pointer transition-colors`}>
                        {username}
                    </span>
                </div>
                
                {/* Message/Description */}
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-0.5 truncate`}>
                    {item.message}
                </p>
                
                {/* Type and Timestamp */}
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs font-medium ${colorClass}`}>{item.type.toUpperCase().replace('_', ' ')}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatTimeAgo(item.createdAt || item.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



// --- Dashboard View ---
const DashboardView = ({ analytics, themeClasses }) => {
  
  // Use the mock data here (in a real app, this data would be passed via props 
  // from the parent component that made the API call).
  const [recentActivity , setRecentActivity] = useState([]);

const getAllActivities = async()=>{
  try {
    const resp = await api.get("/admin/activity-feed");
    console.log("resp from all the recent", resp.data.activities)
    setRecentActivity( resp.data.activities)
  } catch (error) {
    console.log("error in fetching all the activities" , error)
  }
}

useEffect(()=>{
  getAllActivities();
},[])

  
  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className={`text-3xl font-extrabold ${themeClasses.text}`}>Analytics Dashboard</h1>

      {/* Stat Cards (KEPT) */}
      <div className="grid grid-cols-1 mt-4 mb-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={analytics.totalUsers} icon={<Users className="w-10 h-10 text-blue-500" />} colorClass="border-blue-600" themeClasses={themeClasses} />
        <StatCard title="Total Communities" value={analytics.totalCommunities} icon={<Globe className="w-10 h-10 text-green-500" />} colorClass="border-green-600" themeClasses={themeClasses} />
        <StatCard title="Total Posts" value={analytics.totalPosts} icon={<LayoutDashboard className="w-10 h-10 text-yellow-500" />} colorClass="border-yellow-600" themeClasses={themeClasses} />
        <StatCard title="New Users (Last 7 Days)" value={analytics.newUsersLastWeek} icon={<Users className="w-10 h-10 text-red-500" />} trend="+8.5%" colorClass="border-red-600" themeClasses={themeClasses} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 pt-6 gap-6">
        
        {/* Replacement 1: Recent Activity Log */}
        <RecentActivityCard 
            activity={recentActivity} 
            themeClasses={themeClasses} 
        />
      

      </div>
    </div>
  );
};

// --- Users View ---
const UsersView = ({ users, handleUserUpdate, themeClasses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const onSave = async (userId, formData) => {
    try {
      console.log(`[API Call Mock] PATCH /api/v1/admin/users/${userId}`, formData);
      const resp = await api.patch(`http://localhost:3001/api/v1/admin/users/${userId}`, formData);
      console.log("response from patch", resp);
      console.log("formdata to send", formData)
      handleUserUpdate(userId, formData);
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.log("error occured in updating the user ", error)
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className={`text-3xl font-extrabold ${themeClasses.text} mb-6`}>User Management ({formatNumber(users.length)})</h1>

      {/* User Table */}
      <div className={`shadow-lg rounded-xl overflow-x-auto ${themeClasses.cardBg}`}>
        <table className={`min-w-full divide-y ${themeClasses.tableDivider}`}>
          <thead className={themeClasses.tableHeadBg}>
            <tr>
              {['Username', 'Email', 'Role', 'Joined', 'Actions'].map((header) => (
                <th key={header} className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.tableHeadText} uppercase tracking-wider`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={themeClasses.tableDivider}>
            {users.map((user) => (
              <tr key={user._id} className={`${themeClasses.tableRowHover}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.tableBodyText}`}>{user.username}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-200 text-red-800' :
                    user.role === 'moderator' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    } ${themeClasses.isDark ? 'dark:bg-opacity-50 dark:text-opacity-100' : ''}`}>
                    {user.role}
                  </span>
                </td>

                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.createdAt.substring(0, 10)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditClick(user)}
                    className={`${themeClasses.primaryText} ${themeClasses.primaryHoverText} transition duration-150 p-2 rounded-full ${themeClasses.isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && isModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
          themeClasses={themeClasses}
        />
      )}
    </div>
  );
};

// --- Communities View ---
const formatPostDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- Updated to accept new action handlers ---
const PostListModal = ({
  posts,
  communityName,
  onClose,
  themeClasses,
  onDeletePost,
  onReportPost
}) => {
  const isDark = themeClasses.isDark;

  const ActionButton = ({ icon: Icon, label, onClick, colorClass, hoverClass }) => (
    <button
      onClick={onClick}
      className={`flex items-center text-sm font-medium p-1.5 rounded transition duration-150 ${colorClass} ${hoverClass}`}
      title={label}
    >
      <Icon sx={{ fontSize: 18 }} className="mr-1" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-2xl w-full max-w-4xl p-8 shadow-3xl overflow-y-auto max-h-[95vh] transform transition-all duration-300`}>

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className={`text-3xl font-extrabold ${themeClasses.text} flex items-center`}>
            Discussions in: <span className={`${themeClasses.primaryText} ml-2`}>{communityName}</span>
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition duration-150`}
            title="Close"
          >
            <Close />
          </button>
        </div>

        {/* Post List Body */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className={`text-center p-6 italic text-lg rounded-xl ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              No discussions found for this community.
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className={`p-5 rounded-xl transition duration-200 ease-in-out ${isDark ? 'bg-gray-800 hover:bg-gray-700/80 border border-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} shadow-md`}
              >

                {/* Post Title & Content */}
                <h4 className={`text-xl font-bold ${themeClasses.text} mb-2`}>
                  {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
                </h4>

                {/* Image Attachments */}
                {/* ... (Existing Image logic goes here) ... */}
                {post.images && post.images.length > 0 && (
                  <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {/* ... (Existing Image rendering) ... */}
                  </div>
                )}

                {/* --- POST METADATA & ACTIONS --- */}
                <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center text-sm">
                    {/* Author and Date */}
                    <div className={`flex items-center space-x-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center font-semibold text-xs">
                        <AccountCircle sx={{ fontSize: 18 }} className="mr-1" />
                        {post.author?.username || 'Unknown User'}
                      </span>
                      <span className="flex items-center text-xs">
                        <ScheduleOutlined sx={{ fontSize: 16 }} className="mr-1" />
                        {formatPostDate(post.createdAt)}
                      </span>
                    </div>

                    {/* Votes and Comments */}
                    <div className="flex items-center space-x-4">
                      <span className={`flex items-center font-medium ${themeClasses.primaryText}`}>
                        <ThumbUpOutlined sx={{ fontSize: 16 }} className="mr-1" />
                        {post.voteCount || post.upvotes?.length || 0} Votes
                      </span>
                      <span className={`flex items-center font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        <ChatBubbleOutline sx={{ fontSize: 16 }} className="mr-1" />
                        {post.commentCount || 0} Comments
                      </span>
                    </div>
                  </div>

                  {/* Admin Actions Bar */}
                  <div className="flex justify-center space-x-3 mt-3">
                    <ActionButton
                      icon={FlagOutlined}
                      label={`Reports (${post.reports?.length || 0})`}
                      onClick={() => onReportPost(post._id)}
                      colorClass={isDark ? 'text-yellow-400' : 'text-yellow-600'}
                      hoverClass={isDark ? 'hover:bg-yellow-900/40' : 'hover:bg-yellow-100'}
                    />
                    <ActionButton
                      icon={DeleteOutline}
                      label="Delete"
                      onClick={() => onDeletePost(post._id)}
                      colorClass="text-red-500"
                      hoverClass={isDark ? 'hover:bg-red-900/40' : 'hover:bg-red-100'}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ReportsViewModal = ({ reportsData, onClose, onAddReport, themeClasses }) => {
  const isDark = themeClasses.isDark;
  const { postId, reports } = reportsData;

  const handleAddReportClick = () => {
    const reason = prompt("Enter reason for administrative report:");
    if (reason && reason.trim()) {
      onAddReport(postId, reason);
    } else if (reason !== null) {
      alert("Report cancelled: A valid reason must be provided.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4">
      <div className={`${themeClasses.cardBg} rounded-xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]`}>

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className={`text-2xl font-bold ${themeClasses.text} flex items-center`}>
            <Flag className="mr-2 text-red-500" />
            Reports for Post ID: {postId.substring(0, 8)}...
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'} transition`}
            title="Close"
          >
            <Close />
          </button>
        </div>

        {/* Report List */}
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className={`text-center p-4 italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No reports recorded for this post.
            </p>
          ) : (
            reports.map((report, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-red-50 border border-red-200'}`}
              >
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-red-800'} mb-1`}>
                  {report.reason}
                </p>
                <div className={`flex justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  <span className="flex items-center">
                    <AccountCircle sx={{ fontSize: 14 }} className="mr-1" />
                    Reported By: {report.user?.username || report.user || 'Unknown'}
                  </span>
                  <span className="flex items-center">
                    <ScheduleOutlined sx={{ fontSize: 14 }} className="mr-1" />
                    {new Date(report.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-dashed">
          <button
            onClick={handleAddReportClick}
            className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition"
          >
            + Add Administrative Report
          </button>
          {/* Placeholder for resolving reports: */}
          {/* <button className="mt-2 w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">
                        Resolve All Reports
                    </button> */}
        </div>
      </div>
    </div>
  );
};

// --- 2. Main Component (CommunitiesView) ---
const CommunitiesView = ({ communities, themeClasses }) => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportsToView, setReportsToView] = useState(null);

  const fetchPostsByCommunity = async (communityId, communityName) => {
    setIsLoading(true);
    setPosts([]); // Clear previous posts
    setSelectedCommunity({ id: communityId, name: communityName });
    setIsModalOpen(true); // Open modal immediately with loading state

    try {
      // ✅ Correct API path using the imported 'api' instance
      const resp = await api.get(`/admin/communities/${communityId}/posts`);
      console.log("resp from posts", resp)
      setPosts(resp.data.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClick = (communityId, communityName) => {
    fetchPostsByCommunity(communityId, communityName);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommunity(null);
    setPosts([]);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm(`Are you sure you want to permanently delete post ${postId}?`)) {
      try {
        const resp = await api.delete(`http://localhost:3001/api/v1/admin/posts/${postId}`);
        console.log("resp from handleDelete", resp)

        setPosts(prev => prev.filter(p => p._id !== postId));

      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  const handleViewReports = (postId) => {
    // 1. Find the post in the current state
    const post = posts.find(p => p._id === postId);

    if (post && post.reports && post.reports.length > 0) {
      // 2. Set the state to open the reports modal
      setReportsToView({
        postId: postId,
        reports: post.reports
      });
    } else {
      alert("This post currently has no reports to display.");
      // Optionally, still set state to show an empty modal with the option to report
      setReportsToView({ postId: postId, reports: [] });
    }
  };

  const handleAdminReportPost = async (postId) => {
    // 1. Prompt Admin for a reason
    const reason = prompt("Please enter the administrative reason for reporting this post:");

    // Check if the admin clicked Cancel or provided an empty string
    if (reason === null) {
      // Admin clicked cancel
      return;
    }

    if (reason.trim() === "") {
      alert("Report cancelled: A valid reason must be provided.");
      return;
    }

    try {
      // 2. Send POST request to the backend controller
      // Route assumed: POST /admin/posts/:postId/report
      const response = await api.put(`http://localhost:3001/api/v1/admin/posts/${postId}/report`, { reason });

      const updatedPostData = response.data.data;

      // 3. Update the posts state to reflect the new report count
      setPosts(prev => prev.map(p =>
        p._id === postId ? {
          ...p,
          reports: updatedPostData.reports // Use the updated reports array from the backend response
        } : p
      ));

      alert(`Post successfully reported! New report count: ${updatedPostData.reports.length}`);

    } catch (error) {
      console.error("Failed to report post:", error);

      // Handle specific error messages from the backend (e.g., Post not found)
      const errorMessage = error.response?.data?.message || 'Server error during reporting.';
      alert(`Error reporting post: ${errorMessage}`);
    }
  };


  return (
    <div className="p-4 md:p-8">
      <h1 className={`text-3xl font-extrabold ${themeClasses.text} mb-6`}>Community Management ({formatNumber(communities.length)})</h1>

      <div className={`shadow-lg rounded-xl overflow-x-auto ${themeClasses.cardBg}`}>
        <table className={`min-w-full divide-y ${themeClasses.tableDivider}`}>
          <thead className={themeClasses.tableHeadBg}>
            <tr>
              {['Name', 'Slug', 'Category', 'Members', 'Status', 'Created On', 'Discussions'].map((header) => (
                <th key={header} className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.tableHeadText} uppercase tracking-wider`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={themeClasses.tableDivider}>
            {communities.map((comm) => (
              <tr key={comm._id} className={`${themeClasses.tableRowHover}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${themeClasses.tableBodyText}`}>{comm.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.isDark ? 'text-gray-400' : 'text-gray-500'}`}>{comm.slug}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {comm.categories.map((c, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.tableBodyText} font-semibold`}>{formatNumber(comm.memberCount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${comm.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    } ${themeClasses.isDark ? 'dark:bg-opacity-50 dark:text-opacity-100' : ''}`}>
                    {comm.isActive ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.isDark ? 'text-gray-400' : 'text-gray-500'}`}>{comm.createdAt.substring(0, 10)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* ✅ Updated button to call the handler */}
                  <button
                    onClick={() => handleViewClick(comm._id, comm.name)}
                    className={`${themeClasses.primaryText} ${themeClasses.primaryHoverText} transition duration-150 font-bold`}
                  >
                    View <Visibility />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 3. Render Modal --- */}
      {isModalOpen && selectedCommunity && (
        <PostListModal
          posts={posts}
          communityName={selectedCommunity.name}
          onClose={handleCloseModal}
          themeClasses={themeClasses}
          onDeletePost={handleDeletePost}
          onReportPost={handleAdminReportPost}
        />
      )}
      {reportsToView && (
        <ReportsViewModal
          reportsData={reportsToView}
          onClose={() => setReportsToView(null)}
          onAddReport={handleAdminReportPost} // Pass the handler to add a new report
          themeClasses={themeClasses}
        />
      )}

      {/* Simple Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <p className="text-white text-lg p-4 bg-blue-600 rounded-lg shadow-xl">Loading discussions...</p>
        </div>
      )}
    </div>
  );
};


// =======================================================
// LAYOUT & MAIN APP
// =======================================================

const NavItem = ({ icon: Icon, name, isSelected, onClick, themeClasses }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full py-3 px-6 rounded-lg transition-all duration-200 ${isSelected
      ? themeClasses.sidebarItemActive
      : `${themeClasses.isDark ? 'text-gray-300' : 'text-gray-700'} ${themeClasses.sidebarItemHover}`
      }`}
  >
    <Icon className="w-5 h-5 mr-3" />
    {name}
  </button>
);

const Sidebar = ({ currentView, setCurrentView, theme, toggleTheme, themeClasses , navigate }) => (
  <div className={`w-64 min-h-screen ${themeClasses.sidebarBg} p-4 fixed top-0 left-0 hidden md:block`}>
    <div className={`text-2xl font-bold ${themeClasses.sidebarText} mb-10 mt-2`}>
      Discussify <span className="text-blue-500">Admin</span>
    </div>
    <nav className="space-y-2">
      <NavItem
        icon={LayoutDashboard}
        name="Dashboard"
        isSelected={currentView === VIEWS.DASHBOARD}
        onClick={() => setCurrentView(VIEWS.DASHBOARD)}
        themeClasses={themeClasses}
      />
      <NavItem
        icon={Users}
        name="Users"
        isSelected={currentView === VIEWS.USERS}
        onClick={() => setCurrentView(VIEWS.USERS)}
        themeClasses={themeClasses}
      />
      <NavItem
        icon={Globe}
        name="Communities"
        isSelected={currentView === VIEWS.COMMUNITIES}
        onClick={() => setCurrentView(VIEWS.COMMUNITIES)}
        themeClasses={themeClasses}
      />

      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
     <NavItem
          icon={LogOut} // Use the new icon
          name="Logout"
          isSelected={false} // Never selected
          onClick={()=>{  
            localStorage.clear();
            navigate('/login')
            }} // Assume you have a logout handler
          themeClasses={themeClasses}
        />

    </nav>

  </div>
);

const AdminPanel = () => {
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [analytics, setAnalytics] = useState({});
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- Theme State & Handler ---
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const themeClasses = useMemo(() => ({
    ...getThemeClasses(theme),
    isDark: theme === 'dark',
  }), [theme]);
  // -----------------------------

  const getAllUsers = async () => {
    try {
      const resp = await api.get("http://localhost:3001/api/v1/admin/users");
      console.log("resp from users", resp)
      setUsers(resp.data.data);
    } catch (error) {
      console.log("error in fetching user details", error)
    }
  }

  const getAllCommunities = async () => {
    try {
      const resp = await api.get("http://localhost:3001/api/v1/admin/communities");
      console.log("resp from communities", resp)
      setCommunities(resp.data.data)
    } catch (error) {
      console.log("error while fetching commmunities", error)
    }
  }



  useEffect(() => {
    // Simulate fetching data from your backend API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resp = await api.get("http://localhost:3001/api/v1/admin/analytics")
        console.log("resp", resp)
        setAnalytics(resp.data.data);
      } catch (error) {
        console.error("Failed to fetch admin data ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    getAllUsers();
    getAllCommunities();
  }, []);

  // Handler for updating user details (used by the Modal)
  const handleUserUpdate = useCallback((userId, newDetails) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === userId ? { ...user, ...newDetails } : user
      )
    );
  }, []);



  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={`flex justify-center items-center h-full min-h-screen ${themeClasses.text} text-xl`}>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading Admin Data...
        </div>
      );
    }

    switch (currentView) {
      case VIEWS.DASHBOARD:
        return <DashboardView analytics={analytics} themeClasses={themeClasses} />;
      case VIEWS.USERS:
        return <UsersView users={users} handleUserUpdate={handleUserUpdate} themeClasses={themeClasses} />;
      case VIEWS.COMMUNITIES:
        return <CommunitiesView communities={communities} themeClasses={themeClasses} />;
      default:
        return <h1 className={`${themeClasses.text} text-3xl p-8`}>404 View Not Found</h1>;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} font-sans`}>
      {/* Mobile Nav Header */}
      <div className={`md:hidden ${themeClasses.cardBg} border-b ${themeClasses.cardBorder} p-4 flex justify-between items-center`}>
        <div className={`text-xl font-bold ${themeClasses.text}`}>Discussify Admin</div>
        <select
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value)}
          className={`${themeClasses.inputBg} ${themeClasses.inputText} p-2 rounded-lg`}
        >
          {Object.values(VIEWS).map(view => (
            <option key={view} value={view}>{view}</option>
          ))}
        </select>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar (Desktop) */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          theme={theme}
          toggleTheme={toggleTheme}
          themeClasses={themeClasses}
          navigate={navigate}
        />

        {/* Content Area */}
        <main className="flex-1 transition-all duration-300 md:ml-64">
          <div className="min-h-screen">
            {renderContent()}
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminPanel;