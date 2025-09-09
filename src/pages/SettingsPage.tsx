import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  const settingSections = [
    {
      title: 'Profile Settings',
      icon: User,
      fields: [
        { label: 'Full Name', type: 'text', value: 'Admin User', placeholder: 'Enter your name' },
        { label: 'Email', type: 'email', value: 'admin@example.com', placeholder: 'Enter your email' },
        { label: 'Bio', type: 'textarea', value: 'System Administrator', placeholder: 'Tell us about yourself' },
      ],
    },
    {
      title: 'Notification Preferences',
      icon: Bell,
      toggles: [
        { label: 'Email Notifications', description: 'Receive updates via email', state: emailNotifications, setState: setEmailNotifications },
        { label: 'Push Notifications', description: 'Browser push notifications', state: pushNotifications, setState: setPushNotifications },
      ],
    },
    {
      title: 'Security',
      icon: Shield,
      toggles: [
        { label: 'Two-Factor Authentication', description: 'Add an extra layer of security', state: twoFactor, setState: setTwoFactor },
        { label: 'Public Profile', description: 'Make your profile visible to others', state: publicProfile, setState: setPublicProfile },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass rounded-xl p-6 sticky top-24">
            <nav className="space-y-1">
              {settingSections.map((section, index) => (
                <motion.button
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                >
                  <section.icon size={20} />
                  <span>{section.title}</span>
                </motion.button>
              ))}
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Palette size={20} />
                <span>Appearance</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Globe size={20} />
                <span>Language & Region</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Database size={20} />
                <span>Data & Privacy</span>
              </button>
            </nav>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {settingSections.map((section, sectionIndex) => (
            <div key={section.title} className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                  <section.icon size={20} className="text-accent" />
                </div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>

              {section.fields && (
                <div className="space-y-4">
                  {section.fields.map((field, index) => (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                    >
                      <label className="block text-sm font-medium mb-2">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          defaultValue={field.value}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg bg-muted/50 border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          defaultValue={field.value}
                          placeholder={field.placeholder}
                          className="w-full h-11 px-4 rounded-lg bg-muted/50 border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {section.toggles && (
                <div className="space-y-4">
                  {section.toggles.map((toggle, index) => (
                    <motion.div
                      key={toggle.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{toggle.label}</p>
                        <p className="text-sm text-muted-foreground">{toggle.description}</p>
                      </div>
                      <button
                        onClick={() => toggle.setState(!toggle.state)}
                        className={`transition-all ${toggle.state ? 'text-accent' : 'text-muted-foreground'}`}
                      >
                        {toggle.state ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-3"
          >
            <button className="px-6 py-2 rounded-lg glass border border-border hover:bg-muted/50 transition-all">
              Cancel
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
              <Save size={20} />
              Save Changes
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}