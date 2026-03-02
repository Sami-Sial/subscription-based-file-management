import { Github, Linkedin, Briefcase, FileText } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const links = [
        {
            name: 'Portfolio',
            href: 'https://yourportfolio.com',
            icon: Briefcase,
        },
        {
            name: 'GitHub',
            href: 'https://github.com/yourusername',
            icon: Github,
        },
        {
            name: 'LinkedIn',
            href: 'https://linkedin.com/in/yourusername',
            icon: Linkedin,
        },
        {
            name: 'Resume',
            href: '/resume.pdf',
            icon: FileText,
        },
    ];

    return (
        <footer className="py-4 px-6 border-t border-gray-100">
            <div className="max-w-6xl mx-auto">
                {/* Links */}
                <div className="flex items-center justify-center gap-4 mb-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer group"
                                title={link.name}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-medium">{link.name}</span>
                            </a>
                        );
                    })}
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-[10px] text-gray-400">
                        © {currentYear} FileCloud Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}