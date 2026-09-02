import { DownloadStatus } from '@shared/models';

export interface DownloadsStatusFilterModel {
  name: string;
  value: DownloadStatus;
  label: string;
  class: string;
}

export const DOWNLOADS_STATUS_FILTERS: DownloadsStatusFilterModel[] = [
  {
    name: 'total',
    value: DownloadStatus.TOTAL,
    label: 'Total',
    class: 'text-white bg-white/10',
  },
  {
    name: 'done',
    value: DownloadStatus.DONE,
    label: 'Done',
    class: 'text-green-500 bg-green-500/10',
  },
  {
    name: 'failed',
    value: DownloadStatus.FAILED,
    label: 'Failed',
    class: 'text-red-400 bg-red-500/10',
  },
  {
    name: 'canceled',
    value: DownloadStatus.CANCELED,
    label: 'Canceled',
    class: 'text-gray-300 bg-gray-500/10',
  },
];
