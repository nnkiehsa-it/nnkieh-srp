import type { AppIconName } from '@/components/ui/AppIcon.vue';

export type MarkdownEditorCommandId =
  | 'h1'
  | 'h2'
  | 'list'
  | 'numlist'
  | 'quote'
  | 'code'
  | 'table'
  | 'divider';

export interface MarkdownEditorCommand {
  id: MarkdownEditorCommandId;
  title: string;
  subtitle: string;
  iconName: AppIconName;
  keywords: string[];
  toolbarTitle: string;
}

export const MARKDOWN_EDITOR_COMMANDS: MarkdownEditorCommand[] = [
  {
    id: 'h1',
    title: 'text.feae30123013',
    subtitle: 'text.200c6038bfad',
    iconName: 'h1',
    keywords: ['h1', 'title', '1', 'header', 'heading', 'da', 'biaoti'],
    toolbarTitle: 'text.feae30123013',
  },
  {
    id: 'h2',
    title: 'text.12ec8e02d986',
    subtitle: 'text.b037fd6574f8',
    iconName: 'h2',
    keywords: ['h2', 'title', '2', 'header', 'heading', 'zhong', 'biaoti'],
    toolbarTitle: 'text.12ec8e02d986',
  },
  {
    id: 'list',
    title: 'text.edea74e24d34',
    subtitle: 'text.9cc6667d74a2',
    iconName: 'list',
    keywords: ['list', 'bullet', 'unordered', 'ul', 'xiangmu', 'qingdan'],
    toolbarTitle: 'text.edea74e24d34',
  },
  {
    id: 'numlist',
    title: 'text.b1af5ce00735',
    subtitle: 'text.add7772ba3b8',
    iconName: 'numlist',
    keywords: ['numlist', 'number', 'ordered', 'ol', 'ordered list', 'bianhao', 'qingdan'],
    toolbarTitle: 'text.b1af5ce00735',
  },
  {
    id: 'table',
    title: 'text.2fddb1bfbe57',
    subtitle: 'text.6a15c65e71f6',
    iconName: 'table',
    keywords: ['table', 'grid', 'excel', 'charu', 'biaoge'],
    toolbarTitle: 'text.2fddb1bfbe57',
  },
];
