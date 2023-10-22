'use client';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { z } from 'zod';
import Simplebar from 'simplebar-react';
import { useResizeDetector } from 'react-resize-detector';
import { Page, Document, pdfjs } from 'react-pdf';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Search, RotateCw, Loader2, ChevronUp, ChevronDown } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { PdfFullscreen } from '@/components/PdfFullscreen';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PdfRendererProps {
  url: string;
}

export function PdfRenderer({ url }: PdfRendererProps) {
  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

  const CustomPageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type ICustomPageValidator = z.infer<typeof CustomPageValidator>;

  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ICustomPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(CustomPageValidator),
  });

  function previusPage() {
    setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
    setValue('page', String(currentPage - 1));
  }

  function nextPage() {
    setCurrentPage((prev) => (prev + 1 > numPages! ? numPages! : prev + 1));
    setValue('page', String(currentPage + 1));
  }

  function handlePageSubmit({ page }: ICustomPageValidator) {
    setCurrentPage(Number(page));
    setValue('page', String(page));
  }

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currentPage <= 1}
            variant={'ghost'}
            aria-label="previus page"
            onClick={previusPage}>
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              className={cn('w-12 h-8', errors.page && 'focus-visible:ring-red-500')}
              {...register('page')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currentPage === numPages}
            variant={'ghost'}
            aria-label="next page"
            onClick={nextPage}>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant={'ghost'}>
                <Search className="h-4 w-4" />
                {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>100%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>150%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>200%</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>250%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            aria-label="rotate 90 degress"
            variant={'ghost'}
            onClick={() => setRotation((prev) => prev + 90)}>
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <Simplebar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 w-6 h-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Erro loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="max-h-full"
              file={url}>
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  key={'@' + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width ? width : 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                key={'@' + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </Simplebar>
      </div>
    </div>
  );
}
