<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\Entity\Like;
use App\Entity\User;
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
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;
        $userId = null;

        $posts = $this->em->getRepository(Post::class)->findBy([], ["createdAt" => "DESC"]);

        if (!$posts) {
            return $this->json([]);
        }

        $result = [];
        foreach ($posts as $post) {
            $likesCount = count($post->getLikes());
            $likedByMe = false;
            error_log("GuestToken from request: " . $guestToken);

            if ($userId != null) {
                $likedByMe = (bool) $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "user" => $userId]);
            } elseif ($guestToken) {
                $likedByMe = (bool) $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "guestToken" => $guestToken]);
            }

            $result[] = [
                "id" => $post->getId(),
                "content" => $post->getContent(),
                "created_at" => $post->getCreatedAt()->format("c"),
                "authorToken" => $post->getAuthorToken(),
                "likesCount" => $likesCount,
                "likedByMe" => $likedByMe,
            ];
        }

        return $this->json($result);
    }

    #[Route("/api/posts", name: "create", methods: ["POST"])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $content = $data["content"] ?? null;
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;
        $userId = $data["userId"] ?? null;

        if (!$content) {
            return $this->json(["error" => "Please include some text in your post."], 400);
        } elseif (strlen($content) > 255) {
            return $this->json(["error" => "The maximum post length is 255 characters.", 400]);
        }

        $post = new Post();
        $post->setContent($content);
        if ($userId) {
            $user = $this->em->getRepository(User::class)->find($userId);
            if ($user)
                $post->setAuthor($user);
        } else if ($guestToken) {
            $post->setAuthorToken($guestToken);
        } else {
            return $this->json(["error" => "Missing authentication."], 400);
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

        $data = json_decode($request->getContent(), true);
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;
        $userId = $data["userId"] ?? null;

        $isAuthor = ($post->getAuthor()?->getId() === (int) $userId) || ($post->getAuthorToken() === $guestToken);

        if (!$isAuthor)
            return $this->json(["error" => "Forbidden"], 403);

        $this->em->remove($post);
        $this->em->flush();

        return $this->json(["success" => true], 200);
    }

    #[Route("/api/posts/{id}/like", name: "like", methods: ["POST"])]
    public function like(int $id, Request $request): JsonResponse
    {
        $post = $this->em->getRepository(Post::class)->find($id);
        if (!$post)
            return $this->json(["error" => "Post not found", 404]);

        $data = json_decode($request->getContent(), true);
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;
        $userId = $data["userId"] ?? null;

        if ($userId) {
            $user = $this->em->getRepository(User::class)->find($userId);
            if (!$user) return $this->json(["error" => "User not found"], 404);

            $existingLike = $this->em->getRepository(Like::class)->findOneBy(["post" => $post, "user" => $user]);
            if ($existingLike) return $this->json(["error" => "Already liked"], 400);

            $like = (new Like())->setPost($post)->setuserId($userId)->setCreatedAt(new \DateTimeImmutable());
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

    #[Route("api/posts/{id}/like", name: "unlike", methods: ["DELETE"])]
    public function unlike(int $id, Request $request): JsonResponse
    {
        $post = $this->em->getRepository(Post::class)->find($id);
        if (!$post) {
            return $this->json(["error" => "Post not found"], 404);
        }

        $data = json_decode($request->getContent(), true);
        $guestToken = $request->headers->get("X-Guest-Token") ?? null;
        $userId = $data["userId"] ?? null;

        if ($userId) {
            $user = $this->em->getRepository(User::class)->find($userId);
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
                return $this->json(["error" => "Missing authentication."], 400);
            }
            return $this->json(["id" => $id, "message" => "Unliked successfully"], 200);
    }
}
