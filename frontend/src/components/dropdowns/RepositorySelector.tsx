import useTauriValue from '../../hooks/useTauriValue'

export default function RepositorySelector() {
	const path = useTauriValue<any[]>('all_repositories')

	return (
		<div>
			<h1>{path?.join(',')}</h1>
		</div>
	)
}
