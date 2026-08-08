/* eslint-disable perfectionist/sort-objects */
import type { SettingsTab } from '@/features/settings/constants';

import { useState, type ElementType } from 'react';

import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import {
  CompanionSettingsPage,
  GeneralSettingsPage,
} from '@/features/settings/components';
import { settingsQueryParamsSchema } from '@/features/settings/schemas';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Settings2Icon, SparklesIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/settings')({
  loaderDeps: ({ search }) => {
    return {
      tab: search.tab,
    };
  },
  loader: ({ deps }) => {
    return {
      tab: deps.tab,
    };
  },
  head: ({ loaderData }) => {
    const tabTitle =
      loaderData?.tab === 'companion'
        ? m.settings_page_tab_companion()
        : m.settings_page_tab_general();

    return {
      meta: [
        {
          title: createTitle(`${m.settings_page_title()} - ${tabTitle}`),
        },
      ],
    };
  },
  search: {
    middlewares: [stripSearchParams({ tab: 'general' })],
  },
  validateSearch: settingsQueryParamsSchema,
  component: RouteComponent,
});

export const settingsTabsMap = new Map<
  SettingsTab,
  { icon: ElementType; label: string }
>([
  ['general', { label: m.settings_page_tab_general(), icon: Settings2Icon }],
  ['companion', { label: m.settings_page_tab_companion(), icon: SparklesIcon }],
]);

function RouteComponent() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [activeTab, setActiveTab] = useState(tab);

  const handleTabChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        tab: value as SettingsTab,
      }),
    });

    setActiveTab(value as SettingsTab);
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {m.settings_page_title()}
        </h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        defaultValue="general"
      >
        <TabsList variant="line">
          {[...settingsTabsMap.entries()].map(([tabName, values]) => (
            <TabsTrigger key={tabName} value={tabName}>
              <values.icon className="mr-1.5 size-3.5" />
              {values.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsPage />
        </TabsContent>

        <TabsContent value="companion">
          <CompanionSettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
