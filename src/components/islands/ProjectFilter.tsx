import React, { useState, useMemo } from 'react';

interface Project {
    slug: string;
    data: {
        title: string;
        description: string;
        tags: string[];
        date: Date;
        heroImage?: string;
    };
}

interface ProjectFilterProps {
    projects: Project[];
}

export default function ProjectFilter({ projects }: ProjectFilterProps) {
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Extract unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        projects.forEach(p => p.data.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [projects]);

    // Filter logic
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.data.title.toLowerCase().includes(search.toLowerCase()) ||
                project.data.description.toLowerCase().includes(search.toLowerCase());
            const matchesTag = selectedTag ? project.data.tags.includes(selectedTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [projects, search, selectedTag]);

    return (
        <div className="w-full space-y-8 p-4 md:p-10">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <div className="flex-1">
                    <label htmlFor="search" className="sr-only">Search projects</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by name or technology..."
                        className="w-full bg-[#1a1a1a] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedTag === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                        <a
                            key={project.slug}
                            href={`${import.meta.env.BASE_URL}/projects/${project.slug}`}
                            className="block bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
                        >
                            <div className="h-64 bg-slate-800 relative overflow-hidden">
                                {project.data.heroImage ? (
                                    <img
                                        src={project.data.heroImage}
                                        alt={project.data.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-0"
                                        onLoad={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                        }}
                                        style={{ opacity: 0 }}
                                        ref={(img) => {
                                            if (img && img.complete) {
                                                img.style.opacity = '1';
                                            }
                                        }}
                                    />
                                ) : (
                                    /* Placeholder for image */
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-600 font-bold text-4xl group-hover:scale-105 transition-transform">
                                        {project.data.title.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {project.data.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-xs font-mono px-2 py-1 bg-blue-500/10 text-blue-400 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                    {project.data.title}
                                </h3>
                                <p className="text-slate-400 text-sm line-clamp-3">
                                    {project.data.description}
                                </p>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-slate-500">
                        No projects found matching the selected filters.
                    </div>
                )}
            </div>
        </div>
    );
}
