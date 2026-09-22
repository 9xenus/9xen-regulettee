import React, { useState } from 'react';
import { 
  Building2, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Search, 
  Users, 
  Globe, 
  Lock,
  ArrowRight,
  MoreVertical,
  Link,
  Shield,
  FileText,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Entity {
  id: string;
  name: string;
  type: 'parent' | 'subsidiary' | 'office';
  location: string;
  riskScore: number;
  users: number;
  children?: Entity[];
  isExpanded?: boolean;
}

export const HierarchyManager: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: 'lex-global',
      name: '9Xen Regulettee Global Holdings',
      type: 'parent',
      location: 'London, UK',
      riskScore: 24,
      users: 1250,
      isExpanded: true,
      children: [
        {
          id: 'lex-eu',
          name: '9Xen Regulettee Europe B.V.',
          type: 'subsidiary',
          location: 'Amsterdam, NL',
          riskScore: 12,
          users: 450,
          isExpanded: true,
          children: [
            { id: 'lex-nl', name: 'Netherlands Operations', type: 'office', location: 'Amsterdam', riskScore: 8, users: 120 },
            { id: 'lex-de', name: 'Germany Compliance Hub', type: 'office', location: 'Berlin', riskScore: 15, users: 85 },
          ]
        },
        {
          id: 'lex-apac',
          name: '9Xen Regulettee APAC Pte Ltd',
          type: 'subsidiary',
          location: 'Singapore',
          riskScore: 42,
          users: 800,
        }
      ]
    }
  ]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Entity Hierarchy</h2>
            <p className="text-gray-500 mt-1">Manage parent-subsidiary structures and policy inheritance.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search entities..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Add Subsidiary
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Global Organization Map</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="space-y-4">
          {entities.map(entity => (
            <EntityNode key={entity.id} entity={entity} depth={0} />
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
              <Link className="w-4 h-4 mr-2" />
              Inheritance Rules
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Global policies are inherited by all subsidiaries by default. Local admins can only override "Non-Critical" controls.
            </p>
            <button className="mt-4 text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-800">Edit Global Rules</button>
          </div>
          
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
            <h4 className="font-bold text-emerald-900 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              HRIS Permissions
            </h4>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Permissions are currently syncing with <strong>Workday</strong>. 12 departures processed this week.
            </p>
            <button className="mt-4 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800">Sync Org Chart</button>
          </div>

          <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Aggregation Mode
            </h4>
            <p className="text-sm text-purple-700 leading-relaxed">
              Consolidated risk reporting is active. <strong>9Xen Regulettee APAC</strong> is currently impacting global score.
            </p>
            <button className="mt-4 text-xs font-black uppercase tracking-wider text-purple-600 hover:text-purple-800">View Aggregated Risk</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EntityNode: React.FC<{ entity: Entity; depth: number }> = ({ entity, depth }) => {
  const [isExpanded, setIsExpanded] = useState(entity.isExpanded || false);
  const hasChildren = entity.children && entity.children.length > 0;

  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "group flex items-center justify-between p-4 rounded-xl border transition-all",
          depth === 0 ? "bg-white border-gray-300 shadow-sm" : "bg-gray-50/50 border-gray-200",
          "hover:border-blue-400 hover:bg-white"
        )}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-1 rounded hover:bg-gray-100 transition-all text-gray-400",
              !hasChildren && "invisible"
            )}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className={cn(
            "p-2.5 rounded-lg",
            entity.type === 'parent' ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
          )}>
            {entity.type === 'parent' ? <Building2 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900">{entity.name}</h3>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter",
                entity.type === 'parent' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
              )}>
                {entity.type}
              </span>
            </div>
            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> {entity.location}</span>
              <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {entity.users} Users</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="text-right">
            <div className="flex items-center space-x-2 justify-end">
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    entity.riskScore < 20 ? "bg-emerald-500" : entity.riskScore < 40 ? "bg-amber-500" : "bg-red-500"
                  )} 
                  style={{ width: `${entity.riskScore}%` }}
                />
              </div>
              <span className="text-xs font-black text-gray-900">{entity.riskScore}%</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Entity Risk Score</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <FileText className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {entity.children!.map(child => (
            <EntityNode key={child.id} entity={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
