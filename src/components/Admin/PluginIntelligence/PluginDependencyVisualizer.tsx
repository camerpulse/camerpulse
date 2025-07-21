import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePluginIntelligence } from '@/hooks/usePluginIntelligence';
import { Network, AlertTriangle, CheckCircle } from 'lucide-react';

interface DependencyNode {
  id: string;
  name: string;
  level: number;
  dependencies: string[];
  dependents: string[];
  circular: boolean;
  missing: boolean;
}

export const PluginDependencyVisualizer: React.FC = () => {
  const { diagnostics, getPluginsByCategory, getDependencyTree } = usePluginIntelligence();

  const dependencyGraph = useMemo(() => {
    if (!diagnostics) return null;

    const allPlugins = getPluginsByCategory();
    const nodes: DependencyNode[] = [];
    const visited = new Set<string>();

    // Build dependency tree with levels
    const buildGraph = (pluginId: string, level = 0): void => {
      if (visited.has(pluginId) || level > 10) return; // Prevent infinite loops
      visited.add(pluginId);

      const plugin = allPlugins.find(p => p.plugin_id === pluginId);
      if (!plugin) return;

      // Find dependents (plugins that depend on this one)
      const dependents = allPlugins
        .filter(p => p.dependencies.includes(pluginId))
        .map(p => p.plugin_id);

      const node: DependencyNode = {
        id: pluginId,
        name: plugin.plugin_name,
        level,
        dependencies: plugin.dependencies,
        dependents,
        circular: false,
        missing: false
      };

      nodes.push(node);

      // Recursively build for dependencies
      plugin.dependencies.forEach(dep => {
        buildGraph(dep, level + 1);
      });
    };

    // Start with root plugins (those with no dependents)
    const rootPlugins = allPlugins.filter(plugin => 
      !allPlugins.some(p => p.dependencies.includes(plugin.plugin_id))
    );

    rootPlugins.forEach(plugin => buildGraph(plugin.plugin_id));

    return nodes;
  }, [diagnostics, getPluginsByCategory]);

  const getNodeColor = (node: DependencyNode) => {
    if (node.missing) return 'bg-red-100 border-red-300 text-red-800';
    if (node.circular) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (node.dependents.length === 0) return 'bg-green-100 border-green-300 text-green-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const groupedByLevel = useMemo(() => {
    if (!dependencyGraph) return {};
    
    return dependencyGraph.reduce((groups, node) => {
      const level = node.level;
      if (!groups[level]) groups[level] = [];
      groups[level].push(node);
      return groups;
    }, {} as Record<number, DependencyNode[]>);
  }, [dependencyGraph]);

  if (!dependencyGraph) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Dependency Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading dependency graph...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Network className="h-5 w-5 mr-2" />
          Plugin Dependency Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span className="text-xs">Core/Independent</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-300 rounded"></div>
              <span className="text-xs">Has Dependencies</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-300 rounded"></div>
              <span className="text-xs">Circular Reference</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-300 rounded"></div>
              <span className="text-xs">Missing Dependency</span>
            </div>
          </div>

          {/* Dependency Levels */}
          <div className="space-y-4">
            {Object.entries(groupedByLevel)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, nodes]) => (
                <div key={level} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Level {level} {level === '0' ? '(Core/Independent)' : `(Dependency Level ${level})`}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nodes.map(node => (
                      <div
                        key={node.id}
                        className={`p-3 rounded-lg border ${getNodeColor(node)} relative`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm truncate" title={node.name}>
                              {node.name}
                            </h5>
                            <p className="text-xs opacity-75 truncate" title={node.id}>
                              {node.id}
                            </p>
                          </div>
                          {node.circular && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600 ml-1" />
                          )}
                          {node.missing && (
                            <AlertTriangle className="h-4 w-4 text-red-600 ml-1" />
                          )}
                          {!node.circular && !node.missing && node.dependents.length === 0 && (
                            <CheckCircle className="h-4 w-4 text-green-600 ml-1" />
                          )}
                        </div>

                        {/* Dependencies */}
                        {node.dependencies.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium mb-1">Depends on:</p>
                            <div className="flex flex-wrap gap-1">
                              {node.dependencies.slice(0, 3).map(dep => (
                                <Badge key={dep} variant="outline" className="text-xs px-1 py-0">
                                  {dep.split('.').pop()}
                                </Badge>
                              ))}
                              {node.dependencies.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{node.dependencies.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dependents */}
                        {node.dependents.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-1">Used by:</p>
                            <div className="flex flex-wrap gap-1">
                              {node.dependents.slice(0, 3).map(dep => (
                                <Badge key={dep} variant="secondary" className="text-xs px-1 py-0">
                                  {dep.split('.').pop()}
                                </Badge>
                              ))}
                              {node.dependents.length > 3 && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  +{node.dependents.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{dependencyGraph.length}</div>
              <div className="text-xs text-muted-foreground">Total Plugins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {dependencyGraph.filter(n => n.level === 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Core Plugins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.max(...dependencyGraph.map(n => n.level))}
              </div>
              <div className="text-xs text-muted-foreground">Max Depth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {dependencyGraph.filter(n => n.circular).length}
              </div>
              <div className="text-xs text-muted-foreground">Circular Refs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};