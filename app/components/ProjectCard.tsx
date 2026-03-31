type Props = {
  project: {
    id: number;
    title: string;
    githubUrl: string;
    demoUrl: string;
    promotionName: string;
    adaProjectName: string;
  };
};

export default function ProjectCard({ project }: Props) {
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-2">
      <h3 className="font-semibold">{project.title}</h3>
      <p className="text-sm text-gray-500">{project.promotionName} · {project.adaProjectName}</p>
      <div className="flex gap-3 mt-auto pt-2">
        <a href={project.githubUrl} target="_blank" className="text-sm underline">GitHub</a>
        <a href={project.demoUrl} target="_blank" className="text-sm underline">Démo</a>
      </div>
    </div>
  );
}
