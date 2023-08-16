import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { PropsWithChildren, useMemo, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function Dropdown({
	render,
	children,
	...contentProps
}: PropsWithChildren<{
	render: JSX.Element
}> &
	DropdownMenu.DropdownMenuContentProps) {
	const [open, setOpen] = useState(false)

	const side = contentProps.side
	const align = contentProps.align

	const animation = useMemo(() => {
		return {
			initial: {
				opacity: 0,
				scale: 0.9,
				y: side === 'top' ? contentProps.sideOffset : side === 'bottom' ? -(contentProps.sideOffset ?? 4) : 0,
				x: side === 'left' ? contentProps.sideOffset : side === 'right' ? -(contentProps.sideOffset ?? 4) : 0,
			},
			animate: {
				opacity: 1,
				scale: 1,
				y: 0,
				x: 0,
			},
			transition: {
				duration: 0.15,
			},
		}
	}, [side, contentProps.sideOffset])

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

			<AnimatePresence>
				{open && (
					<DropdownMenu.Portal forceMount>
						<DropdownMenu.Content {...contentProps}>
							<motion.div
								className={clsx(
									'bg-white dark:bg-black/10 border dark:border-white/10 shadow rounded-lg p-1 min-w-[100px]',
									{
										'origin-top-left': side === 'bottom' && align === 'start',
										'origin-bottom-left': side === 'top' && align === 'start',
										'origin-top-right': side === 'bottom' && align === 'end',
										'origin-bottom-right': side === 'top' && align === 'end',
										'origin-center': align === 'center',
									}
								)}
								animate={animation.animate}
								initial={animation.initial}
								exit={animation.initial}
								transition={animation.transition}
							>
								{render}
							</motion.div>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				)}
			</AnimatePresence>
		</DropdownMenu.Root>
	)
}
