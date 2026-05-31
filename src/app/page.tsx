import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">AI Ad Assistant</h1>
          <p className="text-muted-foreground text-lg">AI 驱动的广告投放数据分析平台</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />数据大屏
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/upload">
              <Upload className="h-4 w-4 mr-2" />上传数据
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}


