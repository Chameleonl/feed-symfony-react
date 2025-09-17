<?php

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;


class UserController extends AbstractController
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    #[Route("/api/register", name: "register", methods: ["POST"])]
    public function register(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            if (!isset($data['username'], $data['password'])) {
                return $this->json(["error" => "Username and password are required"], 400);
            }

            $existingUser = $this->em->getRepository(User::class)->findOneBy(["username" => $data["username"]]);
            if ($existingUser) {
                return $this->json(["error"=> "Username is already taken"], 400);
            }

            $user = new User();
            $user->setUsername($data["username"]);
            $user->setPassword($hasher->hashPassword($user, $data["password"]));
            $user->setRoles(['ROLE_USER']);

            $em->persist($user);
            $em->flush();
            return $this->json(["message" => "User created successfully"], 201);
        } catch (\Exception $e) {
        return $this->json(["error" => $e->getMessage()], 500);
        }
    }

    #[Route("/api/login", name:"login", methods: ["POST"])]
    public function login(Request $request, UserPasswordHasherInterface $hasher, EntityManagerInterface $em, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            if (!isset($data["username"], $data["password"])) {
                return $this->json(["error" => "Username and password are required"], 400);
            }

            $user = $this->em->getRepository(User::class)->findOneBy(["username" => $data["username"]]);
            if (!$user || !$hasher->isPasswordValid($user, $data["password"])) {
                return $this->json(["error" => "Invalid credentials"], 401);
            }

            $token = $jwtManager->create($user);

            return $this->json([
                "token" => $token,
                "user" => [
                    "id" => $user->getId(),
                    "username" => $user->getUsername(),
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json(["error" => $e->getMessage()], 500);
        }
    }
}
