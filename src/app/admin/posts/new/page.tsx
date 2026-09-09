'use client';

import { useRouter } from 'next/navigation';
import PostForm from '@/components/admin/PostForm';
import { emptyPostFormValues } from '@/lib/admin/postForm';
import { createPost } from '@/lib/api';

export default function NewPostPage() {
  const router = useRouter();

  return (
    <PostForm
      mode="create"
      initialValues={emptyPostFormValues()}
      headerTitle="Create New Blog Post"
      submitLabel="Publish Post"
      submittingLabel="Publishing..."
      onSubmit={createPost}
      onSuccess={() => setTimeout(() => router.push('/admin'), 1200)}
    />
  );
}
