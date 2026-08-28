'use client';

import React, { useState } from 'react';
import { Search, MapPin, Briefcase, GraduationCap, Code2, AlertCircle, Loader2, Trophy, MessageSquare, Activity, Phone, LinkIcon } from 'lucide-react';

interface ProfileSectionItem {
  title: string;
  subtitle: string;
  metadata: string[];
  description: string;
  logoUrl: string;
}

interface ProfileData {
  profileUrl: string;
  name: string;
  profilePicture: string;
  headline: string;
  location: string;
  about: string;
  experience: ProfileSectionItem[];
  education: ProfileSectionItem[];
  skills: string[];
  accomplishments: { category: string; items: string[] }[];
  recommendations: string[];
  contacts: string[];
  recentPost?: { caption: string; picture: string; };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState('');

  const renderListWithBullets = (text: string) => {
    if (!text.includes('•') && !text.includes('·')) {
      return <p className="text-slate-300 leading-relaxed">{text}</p>;
    }

    const bulletChar = text.includes('•') ? '•' : '·';
    const parts = text.split(bulletChar);
    const header = parts[0];
    const bullets = parts.slice(1);

    return (
      <div className="space-y-3">
        <p className="text-slate-100 font-semibold leading-relaxed text-lg">{header.trim()}</p>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 marker:text-indigo-500">
          {bullets.map((b, i) => (
            <li key={i} className="leading-relaxed">{b.trim()}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');
    setProfileData(null);

    try {
      const response = await fetch(`/api/profile?url=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile data');
      }

      setProfileData(result.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>

      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            LinkedIn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Extractor</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-150">
          <form onSubmit={handleExtract} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">
              <Search className="w-6 h-6 text-slate-400 ml-3" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/username/"
                className="w-full bg-transparent border-none outline-none text-slate-200 px-4 py-3 placeholder:text-slate-500 text-lg"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Fetching
                  </>
                ) : (
                  'Extract'
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center text-red-400 animate-in fade-in">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 shadow-xl flex gap-8 items-start">
              <div className="w-32 h-32 rounded-full bg-slate-800 shrink-0"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-slate-800 rounded-md w-1/3"></div>
                <div className="h-4 bg-slate-800 rounded-md w-2/3"></div>
                <div className="h-4 bg-slate-800 rounded-md w-1/4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Data Display */}
        {profileData && !isLoading && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700">

            {/* Top Card */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                {profileData.profilePicture ? (
                  <>
                    <img
                      src={`/api/image?url=${encodeURIComponent(profileData.profilePicture)}`}
                      alt={profileData.name}
                      className="w-40 h-40 rounded-full border-4 border-slate-800 shadow-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback to initial if image fails to load (e.g. 403 Forbidden)
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-40 h-40 rounded-full bg-slate-800 border-4 border-slate-700 shadow-xl flex items-center justify-center shrink-0">
                      <span className="text-4xl text-slate-500">{profileData.name.charAt(0)}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-slate-700 shadow-xl flex items-center justify-center shrink-0">
                    <span className="text-4xl text-slate-500">{profileData.name.charAt(0)}</span>
                  </div>
                )}

                <div className="text-center md:text-left space-y-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{profileData.name}</h2>
                    <p className="text-lg text-indigo-300 font-medium mt-1">{profileData.headline}</p>
                  </div>

                  <div className="space-y-2">
                    {profileData.location && (
                      <div className="flex items-center justify-center md:justify-start text-slate-400">
                        <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    {profileData.contacts && profileData.contacts.length > 0 && (
                      <div className="flex items-center justify-center md:justify-start text-indigo-400">
                        <LinkIcon
                          className="w-4 h-4 mr-1.5 shrink-0" />
                        <a href={profileData.contacts[0].replace('Email', '').replace('LinkedIn', '').trim().startsWith('http') ? profileData.contacts[0].replace('Email', '').replace('LinkedIn', '').trim() : `mailto:${profileData.contacts[0].replace('Email', '').replace('LinkedIn', '').trim()}`} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                          {profileData.contacts[0].replace('Email', '').replace('LinkedIn', '').trim()}
                        </a>
                      </div>
                    )}
                  </div>

                  {profileData.about && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{profileData.about}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grids for Experience, Education, Skills */}
            <div className="flex flex-col gap-8">

              {/* Experience */}
              {profileData.experience && profileData.experience.length > 0 && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Experience</h3>
                  </div>
                  <div className="space-y-8">
                    {profileData.experience.map((exp, index) => (
                      <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-blue-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:w-px after:h-[calc(100%-8px)] after:bg-white/10 last:after:hidden">
                        <div className="flex items-start gap-4">
                          {exp.logoUrl ? (
                            <img src={`/api/image?url=${encodeURIComponent(exp.logoUrl)}`} alt={exp.subtitle} className="w-12 h-12 rounded bg-white shadow-sm object-contain shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              <Briefcase className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 space-y-1 mt-0.5">
                            <h4 className="text-lg font-bold text-slate-100">{exp.title}</h4>
                            {exp.subtitle && <p className="text-slate-300 font-medium">{exp.subtitle}</p>}
                            {exp.metadata && exp.metadata.length > 0 && (
                              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-400">
                                {exp.metadata.map((meta, i) => (
                                  <React.Fragment key={i}>
                                    <span>{meta}</span>
                                    {i < exp.metadata.length - 1 && <span>•</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                            {exp.description && (
                              <div className="mt-3 text-slate-300 text-sm leading-relaxed">
                                {renderListWithBullets(exp.description)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profileData.education && profileData.education.length > 0 && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Education</h3>
                  </div>
                  <div className="space-y-8">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-500 before:rounded-full after:absolute after:left-[3px] after:top-6 after:w-px after:h-[calc(100%-8px)] after:bg-white/10 last:after:hidden">
                        <div className="flex items-start gap-4">
                          {edu.logoUrl ? (
                            <img src={`/api/image?url=${encodeURIComponent(edu.logoUrl)}`} alt={edu.subtitle} className="w-12 h-12 rounded bg-white shadow-sm object-contain shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              <GraduationCap className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                          <div className="flex-1 space-y-1 mt-0.5">
                            <h4 className="text-lg font-bold text-slate-100">{edu.title}</h4>
                            {edu.subtitle && <p className="text-slate-300 font-medium">{edu.subtitle}</p>}
                            {edu.metadata && edu.metadata.length > 0 && (
                              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-400">
                                {edu.metadata.map((meta, i) => (
                                  <React.Fragment key={i}>
                                    <span>{meta}</span>
                                    {i < edu.metadata.length - 1 && <span>•</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                            {edu.description && (
                              <div className="mt-3 text-slate-300 text-sm leading-relaxed">
                                {renderListWithBullets(edu.description)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            {profileData.skills && profileData.skills.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-slate-800/80 border border-white/5 rounded-full text-slate-300 font-medium shadow-sm hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Accomplishments */}
            {profileData.accomplishments && profileData.accomplishments.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-yellow-500/20 rounded-xl text-yellow-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Accomplishments</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.accomplishments.map((acc, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 shadow-inner">
                      {typeof acc === 'string' ? (
                        <p className="text-slate-300 font-medium">{acc}</p>
                      ) : (
                        <>
                          <h4 className="text-lg font-bold text-indigo-300 mb-3">{acc.category}</h4>
                          <ul className="space-y-2">
                            {acc.items.map((item, i) => (
                              <li key={i} className="flex items-start text-slate-300 text-sm">
                                <span className="text-indigo-500 mr-2 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {profileData.recommendations && profileData.recommendations.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Recommendations</h3>
                </div>
                <div className="space-y-6">
                  {profileData.recommendations.map((rec, index) => (
                    <div key={index} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/5 relative shadow-md">
                      <MessageSquare className="absolute top-6 right-6 w-8 h-8 text-white/5" />
                      <p className="text-slate-300 leading-relaxed italic relative z-10">"{rec}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Post */}
            {profileData.recentPost && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-sky-500/20 rounded-xl text-sky-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
                </div>
                <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-white/5">
                  {profileData.recentPost.picture && (
                    <img
                      src={`/api/image?url=${encodeURIComponent(profileData.recentPost.picture)}`}
                      alt="Recent Post"
                      className="w-full h-64 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {profileData.recentPost.caption && (
                    <div className="p-6">
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{profileData.recentPost.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
