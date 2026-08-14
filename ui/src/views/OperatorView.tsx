import { OperatorAnalyticsView } from './operator/OperatorAnalyticsView';
import { OperatorEscalatedView } from './operator/OperatorEscalatedView';
import { OperatorFraud } from './operator/OperatorFraud';

interface OperatorViewProps {
  activeTab?: 'statistics' | 'escalated' | 'fraud';
}

export function OperatorView({ activeTab = 'statistics' }: OperatorViewProps) {
  switch (activeTab) {
    case 'escalated':
      return <OperatorEscalatedView />;
    case 'fraud':
      return <OperatorFraud />;
    case 'statistics':
    default:
      return <OperatorAnalyticsView />;
  }
}