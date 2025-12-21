import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { blogs } from '../mockData';

const Blogs = () => {
  const allBlogs = [
    ...blogs,
    {
      id: 4,
      title: "The Ultimate Guide to Buying Refurbished Laptops in 2025",
      excerpt: "Everything you need to know before purchasing a refurbished laptop, from quality checks to warranty coverage...",
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9",
      date: "Feb 28, 2025",
      slug: "ultimate-guide-buying-refurbished-laptops"
    },
    {
      id: 5,
      title: "Top 10 Refurbished Laptops for Remote Work in 2025",
      excerpt: "Discover the best refurbished laptops perfect for remote work, offering great performance and reliability...",
      image: "https://images.pexels.com/photos/4261790/pexels-photo-4261790.jpeg",
      date: "Feb 25, 2025",
      slug: "top-refurbished-laptops-remote-work"
    },
    {
      id: 6,
      title: "How Refurbished Technology is Helping the Environment",
      excerpt: "Learn about the positive environmental impact of choosing refurbished over new electronics...",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
      date: "Feb 20, 2025",
      slug: "refurbished-technology-environment"
    }
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Our Blog</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Insights, tips, and stories about refurbished technology, sustainability, and making smart tech choices
          </p>
        </div>

        {/* Featured Blog */}
        <div className="mb-16">
          <Card className="overflow-hidden hover:shadow-xl transition">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-video md:aspect-auto">
                <img
                  src={allBlogs[0].image}
                  alt={allBlogs[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{allBlogs[0].date}</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{allBlogs[0].title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{allBlogs[0].excerpt}</p>
                <Link to={`/blog/${allBlogs[0].slug}`}>
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    Read More <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogs.slice(1).map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.slug}`} className="group">
              <Card className="h-full hover:shadow-xl transition overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                  <Button variant="ghost" className="p-0 group-hover:text-blue-600">
                    Read More <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;