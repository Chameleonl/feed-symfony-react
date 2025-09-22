<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\Like;
use App\Entity\User;
use App\Entity\Tag;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class PostController extends AbstractController
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    #[Route("/api/posts", name: "list", methods: ["GET"])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;
        $tagFilter = $request->query->get("tag");
        $qb = $this->em->getRepository(Post::class)->createQueryBuilder('post')->leftJoin('post.tags', 'allTags')->addSelect('allTags')->orderBy('post.createdAt', 'DESC');
        if ($tagFilter) {
            $tagFilter = strtolower(str_replace(' ', '', $tagFilter));
            $qb->innerJoin('post.tags', 'filterTag')
            ->andWhere('LOWER(filterTag.name) = :tag')
            ->setParameter('tag', $tagFilter);
        }

        $posts = $qb->getQuery()->getResult();

        if (!$posts) {
            return $this->json([]);
        }

        $result = [];
        foreach ($posts as $post) {
            $likesCount = count($post->getLikes());
            $likedByMe = false;

            if ($user) {
                $likedByMe = (bool) $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "user" => $user]);
            } elseif ($guestToken) {
                $likedByMe = (bool) $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "guestToken" => $guestToken]);
            } else {
                return $this->json(["error" => "Missing authentication"], 400);
            }

            $result[] = [
                "id" => $post->getId(),
                "content" => $post->getContent(),
                "createdAt" => $post->getCreatedAt(),
                "updatedAt" => $post->getUpdatedAt(),
                "authorName" => $post->getAuthor() ? $post->getAuthor()->getUsername() : $post->getAuthorName(),
                "authorId" => (string) $post->getAuthor()?->getId(),
                "authorToken" => $post->getAuthorToken(),
                "likesCount" => $likesCount,
                "likedByMe" => $likedByMe,
                "tags" => $post->getTags()->map(fn($tag) => $tag->getName())->toArray(),
            ];
        }

        return $this->json($result);
    }

    #[Route("/api/posts", name: "create", methods: ["POST"])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $content = $data["content"];
        if (!$content) {
            return $this->json(["error" => "Please include some text in your post."], 400);
        } elseif (strlen($content) > 255) {
            return $this->json(["error" => "The maximum post length is 255 characters."], 400);
        }

        $post = new Post();
        $post->setContent($content);

        $tags = $data["tags"] ?? [];

        foreach ($tags as $tagName) {
            $tagName = strtolower(str_replace(' ', '', $tagName));
            $tag = $this->em->getRepository(Tag::class)->findOneBy(["name" => $tagName]);
            if (!$tag) {
                $tag = new Tag();
                $tag->setName((string) $tagName);
                $this->em->persist($tag);
            }
            $post->addTag($tag);
        }

        $user = $this->getUser();
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;

        if ($user) {
            $user = $this->em->getRepository(User::class)->find($user);
            if ($user)
                $post->setAuthor($user);
                $post->setAuthorName($user->getUsername());
        } else if ($guestToken) {
            $post->setAuthorToken($guestToken);
            $post->setAuthorName($data['authorName'] ?? 'Guest');
        } else {
            return $this->json(["error" => "Missing authentication"], 400);
        }

        $this->em->persist($post);
        $this->em->flush();

        return $this->json([
            "id" => $post->getId(),
            "content" => $post->getContent(),
            "createdAt" => $post->getCreatedAt()->format("c"),
        ], 201);
    }

    #[Route("/api/posts/{id}", name: "delete", methods: ["DELETE"])]
    public function delete(int $id, Request $request): JsonResponse
    {
        $post = $this->em->getRepository(Post::class)->find($id);
        if (!$post)
            return $this->json(["error" => "Post not found"], 404);

        $user = $this->getUser();
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;

        $userId = $user instanceof User ? $user->getId() : null;

        $isAuthor = ($post->getAuthor()?->getId() === $userId) || ($post->getAuthorToken() === $guestToken);

        if (!$isAuthor)
            return $this->json(["error" => "Forbidden"], 403);

        $this->em->remove($post);
        $this->em->flush();

        return $this->json(["id" => $id, "message" => "Deletion sucessful"], 200);
    }

    #[Route("/api/posts/{id}/like", name: "like", methods: ["POST"])]
    public function like(int $id, Request $request): JsonResponse
    {
        $post = $this->em->getRepository(Post::class)->find($id);
        if (!$post)
            return $this->json(["error" => "Post not found"], 404);

        $user = $this->getUser();
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;

        if ($user) {
            $user = $this->em->getRepository(User::class)->find($user);
            if (!$user) return $this->json(["error" => "User not found"], 404);

            $existingLike = $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "user" => $user]);
            if ($existingLike) return $this->json(["error" => "Already liked"], 400);

            $like = (new Like())->setPost($post)->setUser($user)->setCreatedAt(new \DateTimeImmutable());
        } elseif ($guestToken) {
            $existingLike = $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "guestToken" => $guestToken]);
            if ($existingLike) return $this->json(["error" => "Already liked"], 400);
            $like = (new Like())->setPost($post)->setGuestToken($guestToken)->setCreatedAt(new \DateTimeImmutable());
        } else {
            return $this->json(["error" => "Missing authentication"], 400);
        }


        $this->em->persist($like);
        $this->em->flush();

        return $this->json(["id" => $id, "message" => "Like successful"], 200);
    }

    #[Route("/api/posts/{id}/like", name: "unlike", methods: ["DELETE"])]
    public function unlike(int $id, Request $request): JsonResponse
    {
        $post = $this->em->getRepository(Post::class)->find($id);
        if (!$post) {
            return $this->json(["error" => "Post not found"], 404);
        }

        $user = $this->getUser();
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;

        if ($user) {
            $user = $this->em->getRepository(User::class)->find($user);
            if (!$user) return $this->json(["error" => "User not found"], 404);

            $existingLike = $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "user" => $user]);
            if (!$existingLike) {
                return $this->json(["error" => "Not liked yet"], 400);
            }

            $this->em->remove($existingLike);
            $this->em->flush();
            } elseif ($guestToken) {
                $existingLike = $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "guestToken" => $guestToken]);
                if (!$existingLike) {
                    return $this->json(["error" => "Not liked yet"], 400);
                }

                $this->em->remove($existingLike);
                $this->em->flush();
            } else {
                return $this->json(["error" => "Missing authentication"], 400);
            }
            return $this->json(["id" => $id, "message" => "Unliked successfully"], 200);
    }

    #[Route("/api/posts/{id}", name: "edit", methods: ["PUT"])]
    public function edit(int $id, Request $request): JsonResponse
    {
        $post = $this->em->getRepository(Post::class)->find($id);
        if (!$post)
            return $this->json(["error" => "Post not found"], 404);

        $user = $this->getUser();
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;

        $userId = $user instanceof User ? $user->getId() : null;

        $isAuthor = ($post->getAuthor()?->getId() === $userId) || ($post->getAuthorToken() === $guestToken);

        if (!$isAuthor)
            return $this->json(["error" => "Forbidden"], 403);

        $data = json_decode($request->getContent(), true);
        $newContent = $data["content"] ?? null;
        $newTags = $data["tags"] ?? null;

        if (!$newContent || strlen($newContent) > 255) {
        return $this->json(["error" => "Invalid content"], 400);
        }

        $post->setContent($newContent);
        $post->setUpdatedAt(new \DateTime());
        $post->setTags($newTags);

        $this->em->persist($post);
        $this->em->flush();

        return $this->json(["id" => $id, "message" => "Edited sucessfully", "content" => $post->getContent(), "tags" => $post->getTags(), "updatedAt" => $post->getUpdatedAt()->format("c")], 200);
    }
}
