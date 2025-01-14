'use client';
import html2canvas from 'html2canvas-pro';
import axios from 'axios';
import { ChartLine, Copy, Download, HandHeart, Link } from 'lucide-react';
import { LinkedInResponse, Type } from '../types';
import { useEffect, useState } from 'react';
import { SavingToDB } from '@/app/actions/SavingToDB';
import { useSession } from 'next-auth/react';
import { Bounce, toast } from 'react-toastify';

export function LinkedInCard({
  authorName,
  authorBio,
  followers,
  description,
  authorImageUrl,
  imageUrl,
}: LinkedInResponse) {
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setOnClickCopy] = useState(false);
  const { data: session } = useSession();

  const user = session?.user?.id;

  const handleCardDownload = async () => {
    const sanitizedTitle = followers
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]+/g, '');

    const publicId = `${authorName}_${sanitizedTitle}`;

    const cardElement = document.getElementById('card');
    if (cardElement) {
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        backgroundColor: '#020617',
        scale: 6,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = publicId;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleShareUpload = async () => {
    setIsLoading(true);
    const sanitizedTitle = followers
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]+/g, '');

    const publicId = `${authorName}_${sanitizedTitle}`;
    const cardElement = document.getElementById('card');
    toast.info('Profile not visible? 🔄 Kindly regenerate it!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
      transition: Bounce,
    });
    if (cardElement) {
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        backgroundColor: '#0E64C5',
        scale: 6,
        allowTaint: true,
      });

      const imageBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      );

      if (!imageBlob) {
        console.error('Failed to create image blob');
        return null;
      }
      const formData = new FormData();
      const api_key = process.env.NEXT_PUBLIC_API_KEY as string;
      const upload_preset = process.env.NEXT_PUBLIC_UPLOAD_PRESET as string;
      formData.append('file', imageBlob);
      formData.append('upload_preset', upload_preset);
      formData.append('public_id', publicId);
      formData.append('api_key', api_key);
      try {
        const uploadResponse = await axios.post(
          'https://api.cloudinary.com/v1_1/linktopost/image/upload',
          formData,
        );
        const uploadedImageUrl = uploadResponse.data.secure_url;
        setShareUrl(uploadedImageUrl);
        await SavingToDB(uploadedImageUrl, Type.LINKEDIN, user || '');
        setIsLoading(false);
        return uploadedImageUrl;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
      transition: Bounce,
    });
    setOnClickCopy(true);
  };

  useEffect(() => {
    handleShareUpload();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-y-8 flex-col md:flex-row m-2">
        <div
          id="card"
          className="w-[360px] md:w-[380px] border p-4 rounded-2xl bg-[#0E64C5] overflow-hidden"
        >
          <div className="rounded-2xl">
            <div className="flex items-end relative">
              <img
                src={imageUrl}
                alt="Thumbnail"
                className="w-full object-cover h-48 rounded-t-2xl"
              />
              <div className="absolute z-8 flex-1 bg-neutral-300 backdrop-blur-md min-w-[346px] h-14 rounded-t-2xl"></div>
              <img
                src="./linkedin.png"
                alt="icon"
                className="w-12 h-12 absolute z-5 mb-8 ml-5 rounded-xl bg-white"
              />
              <div className="flex-1 absolute z-9 font-bold text-lg text-black justify-center pl-16 pb-3 truncate w-[310px] text-start">
                {description}
              </div>
            </div>
            <div className="p-4 bg-white rounded-b-2xl space-y-4">
              <div className="flex gap-4 itemd:ml-8ms-center">
                <img
                  src={authorImageUrl}
                  alt="profile"
                  className="w-14 h-14 object-cover rounded-full border-2 border-slate-700"
                />
                <div className="flex flex-col justify-center">
                  <div className="font-bold text-xl text-black font-geistmono">
                    {authorName}
                  </div>
                  <div className="text-slate-700 font-mono truncate w-48">
                    {followers || authorBio}
                  </div>
                </div>
              </div>
              <div className="text-black line-clamp-5 pb-1 text-lg">
                {description}
              </div>
              <div className="text-black flex justify-between items-center">
                <div className="text-[#3FBDD0] font-bold text-xl flex items-center">
                  <a
                    href={''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-1"
                  >
                    <Link className="w-4 self-center h-4" />
                    Link
                  </a>
                </div>
                <div className="flex space-x-4 items-center">
                  <div className="flex gap-1 font-semibold text-red-400 self-center">
                    <HandHeart className="w-6 h-6 self-center" />
                    Like
                  </div>
                  <div className="flex gap-1 self-center font-semibold text-blue-500">
                    <ChartLine className="w-4 h-4 font-semibold self-center" />
                    Views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col md:pl-14 justify-center space-x-8 md:space-x-8 items-center md:space-y-24">
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-white md:ml-8 rounded-lg ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <img
              src="./linkedin.png"
              alt="LinkedIn"
              className="w-12 h-12 rounded-lg hover:scale-150"
            />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this amazing post!`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-white rounded-lg ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <img
              src="./twitter.png"
              alt="Twitter"
              className="w-12 h-12 rounded-lg bg-white border hover:scale-150"
            />
          </a>
          <a
            href={`https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-white rounded-lg ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <img
              src="./insta1.webp"
              alt="Instagram"
              className="w-12 h-12 rounded-lg hover:scale-150"
            />
          </a>
          <button
            className="bg-black/25 w-fit p-3 border border-slate-700 font-bold text-white rounded-lg"
            onClick={handleCardDownload}
          >
            <Download />
          </button>
        </div>
      </div>
      <div className="ml-2 mt-4 flex items-center self-center md:self-start">
        <button
          onClick={() => copyToClipboard(shareUrl)}
          className={`flex items-center gap-2 self-center ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <Copy className="text-neutral-400 hover:text-neutral-200" />
          <span className="text-neutral-400 hover:text-neutral-200 font-mono text-xl font-semibold">
            Copy Link
          </span>
        </button>
      </div>
    </div>
  );
}
