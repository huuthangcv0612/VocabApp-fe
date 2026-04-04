import '../styles/components/tool-card.css'

interface Tool {
  id: string
  title: string
  description: string
  icon: string
  badge: string
}

interface ToolCardProps {
  tool: Tool
  onSelect: () => void
}

const ToolCard = ({ tool, onSelect }: ToolCardProps) => {
  return (
    <div className="tool-card">
      <div className="tool-card-header">
        <span className="tool-badge">{tool.badge}</span>
        <span className="tool-icon">{tool.icon}</span>
      </div>

      <h3 className="tool-title">{tool.title}</h3>
      <p className="tool-description">{tool.description}</p>

      <button className="tool-button" onClick={onSelect}>
        Bắt Đầu
      </button>
    </div>
  )
}

export default ToolCard
