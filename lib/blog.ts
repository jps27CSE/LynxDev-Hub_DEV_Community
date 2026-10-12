import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface BlogPostMeta {
  title: string;
  date: string;
  author: string;
  description: string;
  slug: string;
  tags: string[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), "blog", "engineering");

function slugFromFilename(filename: string): string {
  // Remove leading numbers and .md extension
  return filename
    .replace(/^\d+-/, "")
    .replace(/\.md$/, "");
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    
    const posts = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = path.join(BLOG_DIR, filename);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data } = matter(fileContent);
        
        const slug = data.slug || slugFromFilename(filename);
        
        return {
          title: data.title || "Untitled",
          date: data.date || new Date().toISOString().split("T")[0],
          author: data.author || "LynxDEV Engineering",
          description: data.description || "",
          slug,
          tags: Array.isArray(data.tags) ? data.tags : [],
        } as BlogPostMeta;
      })
    );
    
    return posts.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("[blog] getAllPosts error:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    
    for (const filename of mdFiles) {
      const filePath = path.join(BLOG_DIR, filename);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const { data, content } = matter(fileContent);
      const fileSlug = data.slug || slugFromFilename(filename);
      
      if (fileSlug === slug) {
        return {
          title: data.title || "Untitled",
          date: data.date || new Date().toISOString().split("T")[0],
          author: data.author || "LynxDEV Engineering",
          description: data.description || "",
          slug: fileSlug,
          tags: Array.isArray(data.tags) ? data.tags : [],
          content,
        } as BlogPost;
      }
    }
    return null;
  } catch (error) {
    console.error("[blog] getPostBySlug error:", error);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await getAllPosts();
  return posts.map((p) => p.slug);
}
