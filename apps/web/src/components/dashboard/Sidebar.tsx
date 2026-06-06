'use client'

import { FolderIcon, HomeIcon, SettingsIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useMe } from '@/hooks/api/use-me'

const Sidebar = () => {
    const { data: me } = useMe()
  return (
    <div>
        <div>
            <Image src="/images/logo.svg" alt="Trakr Labs" width={100} height={100} />
        </div>
        <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
            </Link>
            <Link href="/projects" className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                <span>Projects</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                <span>Settings</span>
            </Link>
        </div>
    </div>
  )
}

export default Sidebar