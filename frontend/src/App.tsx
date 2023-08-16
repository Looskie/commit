import Dropdown from './components/Dropdown'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import useTauriValue from '@/hooks/useTauriValue'
import useTauriReset from '@/hooks/useTauriReset'
import { motion, AnimatePresence } from 'framer-motion'
import RepositorySelector from './components/dropdowns/RepositorySelector'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { RepoIcon, GitBranchIcon, RepoTemplateIcon } from '@primer/octicons-react'

type DiffStats = {
	deletions: number
	insertions: number
	files_changed: number
}

const OPACITY_ANIMATION = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
	},
}

const Commit = () => {
	const [title, setTitle] = useState('')
	const titleRef = useRef<HTMLInputElement>(null)
	const [description, setDescription] = useState('')

	const path = useTauriValue<string>('current_dir')
	const repo = useTauriValue<string>('current_repo')
	const diff = useTauriValue<DiffStats>('current_diff')
	const branch = useTauriValue<string>('current_branch')

	useTauriReset(() => {
		setTitle('')
		setDescription('')
	})

	useEffect(() => {
		const unlisten = listen('tauri://focus', () => {
			if (document.activeElement?.tagName == 'BODY') {
				titleRef.current?.focus()
			}
		})

		return () => {
			unlisten.then(f => f())
		}
	})

	const commit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			if (diff?.files_changed === 0) return

			invoke('commit', { path, title, description: description.trim() == '' ? null : description.trim() }).catch(
				error => alert(error)
			)
		},
		[title, description]
	)

	return (
		<form
			className="bg-white/[.99] dark:bg-black/20 rounded-lg overflow-hidden flex flex-col h-screen"
			onSubmit={commit}
		>
			<AnimatePresence>
				<div className="flex items-center justify-between px-3 pt-3 pb-1 pr-6">
					{repo ? (
						<Dropdown render={<RepositorySelector />} align="start" side="bottom">
							<button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-white hover:dark:bg-white/10">
								<RepoIcon className="text-black/50 dark:text-white/50 mt-px" />

								<motion.p
									key="active-repo"
									initial={OPACITY_ANIMATION.initial}
									animate={OPACITY_ANIMATION.animate}
									className="font-medium text-black/80 dark:text-white/80"
								>
									{repo}
								</motion.p>
							</button>
						</Dropdown>
					) : (
						<div className="flex items-center space-x-2 p-1">
							<RepoTemplateIcon className="text-black/50 dark:text-white/50 mt-px" />
							<motion.p
								key="loading-repo"
								exit={OPACITY_ANIMATION.initial}
								animate={OPACITY_ANIMATION.animate}
								className="font-medium text-transparent animate-pulse bg-neutral-200 dark:bg-white/10 rounded-lg"
							>
								tailwindlabs/tailwindcss
							</motion.p>
						</div>
					)}
					<div className="flex items-center space-x-2">
						<GitBranchIcon className="text-black/50 dark:text-white/50 mt-px" />
						{branch ? (
							<motion.p
								layout
								key="active-branch"
								initial={OPACITY_ANIMATION.initial}
								animate={OPACITY_ANIMATION.animate}
								className="font-medium text-black/80 dark:text-white/80"
							>
								{branch}
							</motion.p>
						) : (
							<motion.p
								layout
								key="loading-branch"
								exit={OPACITY_ANIMATION.initial}
								animate={OPACITY_ANIMATION.animate}
								className="font-medium text-transparent animate-pulse bg-neutral-200 dark:bg-white/10 rounded-lg"
							>
								master
							</motion.p>
						)}
					</div>
				</div>
			</AnimatePresence>
			<div className="px-2 flex-1">
				<input
					required
					autoFocus
					type="text"
					value={title}
					ref={titleRef}
					placeholder="Title"
					onChange={e => setTitle(e.target.value)}
					className="text-xl text-black/70 dark:text-white/80 font-medium bg-transparent focus:outline-none p-2 w-full"
				/>
				<textarea
					value={description}
					placeholder="Description"
					onKeyDown={e => {
						if (e.key == 'Enter' && e.metaKey) {
							;(e.target as HTMLTextAreaElement).form?.requestSubmit()
						}
					}}
					onChange={e => setDescription(e.target.value)}
					className="bg-transparent text-black/60 dark:text-white/50 focus:outline-none p-2 w-full no-resize"
				/>
			</div>
			<div className="flex items-center justify-between border-t dark:border-white/5 p-4 bg-white/90 dark:bg-black/10">
				<AnimatePresence mode="popLayout">
					{diff?.files_changed === 0 ? (
						<motion.p
							key="no-changes"
							exit={OPACITY_ANIMATION.initial}
							animate={OPACITY_ANIMATION.animate}
							initial={OPACITY_ANIMATION.initial}
							className="text-black/40 dark:text-white/50"
						>
							No changes detected
						</motion.p>
					) : (
						<div className="flex items-center space-x-4">
							<p className="text-black/40 dark:text-white/50">
								<AnimatePresence mode="popLayout">
									<motion.span layout>{diff?.files_changed ?? '??'}</motion.span>
								</AnimatePresence>{' '}
								file{diff?.files_changed == 1 ? '' : 's'} changed
							</p>

							<div className="h-6 w-px bg-black/10 dark:bg-white/5" />
							<div className="flex items-center space-x-3">
								<div className="flex items-center space-x-2">
									<AnimatePresence>
										{diff?.insertions != null && (
											<motion.p
												exit={OPACITY_ANIMATION.initial}
												initial={OPACITY_ANIMATION.initial}
												animate={OPACITY_ANIMATION.animate}
												className="text-green-600"
											>
												+{diff.insertions}{' '}
											</motion.p>
										)}
									</AnimatePresence>
									<AnimatePresence mode="popLayout">
										{diff?.deletions != null && (
											<motion.p
												exit={OPACITY_ANIMATION.initial}
												key="active-deletions"
												initial={OPACITY_ANIMATION.initial}
												animate={OPACITY_ANIMATION.animate}
												className="text-red-600"
											>
												{' '}
												-{diff.deletions}
											</motion.p>
										)}
									</AnimatePresence>
								</div>
								{/* <div className="flex items-center space-x-[2px]">
							<div className="rounded w-3.5 h-3.5 bg-emerald-500" />
							<div className="rounded w-3.5 h-3.5 bg-red-600/90" />
							<div className="rounded w-3.5 h-3.5 bg-red-600/90" />
							<div className="rounded w-3.5 h-3.5 bg-red-600/90" />
						</div> */}
							</div>
						</div>
					)}
				</AnimatePresence>
				<div>
					{diff?.files_changed !== 0 && (
						<motion.button
							type="submit"
							exit={OPACITY_ANIMATION.initial}
							animate={OPACITY_ANIMATION.animate}
							initial={OPACITY_ANIMATION.initial}
							className="bg-white dark:bg-white/10 border dark:border-white/10 shadow rounded-lg flex items-center space-x-2 py-1 px-2"
						>
							<p className="font-medium text-black/80 dark:text-white/80">Commit</p>
							<span className="text-sm rounded border dark:border-white/5 bg-gray-100 dark:bg-white/5 px-1 -mx-1 text-black/50 dark:text-white/50">
								⌘⏎
							</span>
						</motion.button>
					)}
				</div>
			</div>
		</form>
	)
}

export default Commit
