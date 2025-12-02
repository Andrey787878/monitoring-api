import { useState } from 'react'
import './App.css'

function App() {
	const [activeEndpoint, setActiveEndpoint] = useState(null)
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [lastUpdated, setLastUpdated] = useState(null)
	const [overallStatus, setOverallStatus] = useState('idle')

	const callApi = async (path, label) => {
		setActiveEndpoint(label)
		setLoading(true)
		setError(null)
		setData(null)

		try {
			const res = await fetch(path)
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`)
			}
			const json = await res.json()
			setData(json)
			setLastUpdated(new Date())

			// обновляем общий статус
			if (path === '/health' && json.status === 'healthy') {
				setOverallStatus('ok')
			} else if (path === '/ready' && json.status === 'ready') {
				setOverallStatus('ok')
			} else if (path === '/metrics') {
				setOverallStatus('ok')
			} else {
				setOverallStatus('warn')
			}
		} catch (e) {
			setError(e.message)
			setOverallStatus('error')
		} finally {
			setLoading(false)
		}
	}

	const renderContent = () => {
		if (loading)
			return (
				<p className='status status-loading'>Загружаем {activeEndpoint}…</p>
			)
		if (error) return <p className='status status-error'>Ошибка: {error}</p>
		if (!data)
			return (
				<p className='status status-empty'>
					Выбери эндпоинт, чтобы увидеть данные.
				</p>
			)

		if (activeEndpoint === 'Health') {
			return (
				<div className='card'>
					<h2>Health</h2>
					<p>
						Статус:{' '}
						<span
							className={
								data.status === 'healthy' ? 'badge badge-ok' : 'badge badge-bad'
							}
						>
							{data.status}
						</span>
					</p>
					<p>Версия: {data.version}</p>
					<p>Uptime: {data.uptime_seconds} сек.</p>
				</div>
			)
		}

		if (activeEndpoint === 'Ready') {
			return (
				<div className='card'>
					<h2>Ready</h2>
					<p>
						Статус:{' '}
						<span
							className={
								data.status === 'ready' ? 'badge badge-ok' : 'badge badge-bad'
							}
						>
							{data.status}
						</span>
					</p>
				</div>
			)
		}

		if (activeEndpoint === 'Metrics') {
			return (
				<div className='card'>
					<h2>Runtime metrics</h2>
					<div className='metrics-grid'>
						<div className='metric'>
							<span className='metric-label'>Goroutines</span>
							<span className='metric-value'>{data.goroutines}</span>
						</div>
						<div className='metric'>
							<span className='metric-label'>Memory</span>
							<span className='metric-value'>{data.memory_usage_mb} MB</span>
						</div>
						<div className='metric'>
							<span className='metric-label'>CPU cores</span>
							<span className='metric-value'>{data.cpu_cores}</span>
						</div>
					</div>
				</div>
			)
		}

		return <pre className='json-dump'>{JSON.stringify(data, null, 2)}</pre>
	}

	return (
		<div className='page'>
			<div className='background-gradient' />

			<div className='shell'>
				<header className='topbar'>
					<div>
						<h1>Monitoring API UI</h1>
						<p className='subtitle'>Дашборд /health, /ready и /metrics.</p>
					</div>

					<div className='status-chip-wrapper'>
						<span className={`status-dot status-dot-${overallStatus}`} />
						<span className='status-chip-text'>
							{overallStatus === 'ok' && 'Сервис работает'}
							{overallStatus === 'error' && 'Ошибка запроса'}
							{overallStatus === 'warn' && 'Нестандартный статус'}
							{overallStatus === 'idle' && 'Ожидание запроса'}
						</span>
					</div>
				</header>

				<main className='layout'>
					<aside className='sidebar'>
						<h3>Эндпоинты</h3>
						<button
							className={
								activeEndpoint === 'Health'
									? 'nav-btn nav-btn-active'
									: 'nav-btn'
							}
							onClick={() => callApi('/health', 'Health')}
						>
							<span className='nav-title'>/health</span>
							<span className='nav-desc'>Общее состояние и uptime</span>
						</button>

						<button
							className={
								activeEndpoint === 'Ready'
									? 'nav-btn nav-btn-active'
									: 'nav-btn'
							}
							onClick={() => callApi('/ready', 'Ready')}
						>
							<span className='nav-title'>/ready</span>
							<span className='nav-desc'>Готовность к трафику</span>
						</button>

						<button
							className={
								activeEndpoint === 'Metrics'
									? 'nav-btn nav-btn-active'
									: 'nav-btn'
							}
							onClick={() => callApi('/metrics', 'Metrics')}
						>
							<span className='nav-title'>/metrics</span>
							<span className='nav-desc'>Горутины, память, CPU</span>
						</button>

						{lastUpdated && (
							<p className='last-updated'>
								Обновлено: {lastUpdated.toLocaleTimeString()}
							</p>
						)}
					</aside>

					<section className='content'>{renderContent()}</section>
				</main>
			</div>
		</div>
	)
}

export default App
