import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export function meta() {
  return [{ title: '页面未找到 - Chatty' }, { name: 'description', content: '请求的页面不存在' }];
}

export function loader() {
  throw new Response('Not Found', {
    status: 404,
    statusText: 'Not Found',
  });
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted text-2xl font-semibold">
          404
        </div>
        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">页面未找到</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          这个地址不存在，或页面已经被移动。请返回首页继续使用。
        </p>
        <Button asChild className="mt-7" variant="outline">
          <Link to="/">
            <ArrowLeft />
            返回首页
          </Link>
        </Button>
      </section>
    </main>
  );
}

export default NotFoundPage;

export function ErrorBoundary() {
  return <NotFoundPage />;
}
