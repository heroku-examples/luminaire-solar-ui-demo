'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Settings,
  Database,
  Globe,
  FileText,
  Code,
  ExternalLink,
} from 'lucide-react';

const herokuTools = [
  {
    name: 'Database Schema',
    tool: 'postgres_get_schema',
    icon: Database,
    description: 'Get database schema information',
    docsUrl:
      'https://devcenter.heroku.com/articles/heroku-managed-inference-agents#postgres_get_schema',
  },
  {
    name: 'Database Query',
    tool: 'postgres_run_query',
    icon: Database,
    description: 'Execute SQL queries on PostgreSQL databases',
    docsUrl:
      'https://devcenter.heroku.com/articles/heroku-managed-inference-agents#postgres_run_query',
  },
  {
    name: 'Web Browsing',
    tool: 'html_to_markdown',
    icon: Globe,
    description: 'Convert web pages to markdown',
    docsUrl:
      'https://devcenter.heroku.com/articles/heroku-managed-inference-agents#html_to_markdown',
  },
  {
    name: 'PDF Reading',
    tool: 'pdf_to_markdown',
    icon: FileText,
    description: 'Extract and convert PDF content to markdown',
    docsUrl:
      'https://devcenter.heroku.com/articles/heroku-managed-inference-agents#pdf_to_markdown',
  },
  {
    name: 'Python Code Execution',
    tool: 'code_exec_python',
    icon: Code,
    description: 'Execute Python code in a secure environment',
    docsUrl:
      'https://devcenter.heroku.com/articles/heroku-managed-inference-agents#code_exec_python',
  },
];

export default function DemoPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Demo Architecture</h1>
          <p className="text-xl text-gray-600 mb-6">
            Luminaire Solar AI Assistant powered by Heroku Managed Inference and
            Agents
          </p>
          <Link href="/settings">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Settings className="w-4 h-4 mr-2" />
              Demo Configuration
            </Button>
          </Link>
        </div>

        {/* System Architecture */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>System Architecture</CardTitle>
            <button
              onClick={() => setImagePreview('/architecture.png')}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Click to enlarge
            </button>
          </CardHeader>
          <CardContent>
            <div
              className="relative w-full cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setImagePreview('/architecture.png')}
            >
              <Image
                src="/architecture.png"
                alt="Luminaire Solar Architecture Diagram"
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg border"
                priority
              />
            </div>
          </CardContent>
        </Card>

        {/* Heroku AI Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Heroku AI Tools</CardTitle>
            <CardDescription>
              The Luminaire Solar AI Assistant uses Heroku Managed Inference and
              Agents add-on with the following tools. Click on any tool to view
              detailed documentation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {herokuTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <a
                    key={tool.tool}
                    href={tool.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-4 border rounded-lg hover:border-purple-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {tool.description}
                    </p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 mt-auto">
                      {tool.tool}
                    </code>
                  </a>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <a
                href="https://devcenter.heroku.com/articles/heroku-managed-inference-agents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1"
              >
                Learn more about Heroku Inference Tools
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto p-6 bg-white">
          <DialogTitle className="sr-only">
            Architecture Diagram Preview
          </DialogTitle>
          {imagePreview && (
            <div className="bg-white rounded-lg">
              <Image
                src={imagePreview}
                alt="Architecture Diagram"
                width={1600}
                height={1200}
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
