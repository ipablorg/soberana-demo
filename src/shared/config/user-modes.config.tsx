/**
 * User Modes Configuration
 * 
 * Defines the modes and sections for Suite User
 */

import { Activity, Workflow, Sparkles } from '@/shared/components/animated-icons';
import { ModeItem } from '@/shared/types/navigation';
import { UserMode } from '@/shared/stores/useModeStore';

export const USER_MODES: ModeItem<UserMode>[] = [
  {
    id: 'operator',
    icon: Activity,
    label: 'Operator',
    description: 'Fast operations mode',
    defaultRoute: '/suite/dashboard',
  },
  {
    id: 'builder',
    icon: Workflow,
    label: 'Builder',
    description: 'Create workflows',
    defaultRoute: '/suite/automations',
  },
  {
    id: 'intelligent',
    icon: Sparkles,
    label: 'Intelligent',
    description: 'AI-powered mode',
    defaultRoute: '/suite/intelligent-mode',
  },
];

